const prisma = require('../../config/database');
const { normalizeAddress } = require('../../utils/addressNormalizer');

/**
 * Returns current active purchase quota policy (creates default if not present)
 */
async function getActivePolicy() {
  let policy = await prisma.purchaseQuotaPolicy.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!policy) {
    policy = await prisma.purchaseQuotaPolicy.create({
      data: {
        name: 'Default FarmDirect Consumer Quota Policy',
        firstOrderLimitKg: 5.0,
        subsequentOrderLimitKg: 1.0,
        customerMonthlyMaxKg: 10.0,
        addressMonthlyMaxKg: 10.0,
        shortIntervalHours: 48,
        riskNormalThreshold: 30.0,
        riskWatchThreshold: 60.0,
        riskRestrictedThreshold: 80.0,
        categoryLimitsJson: JSON.stringify({
          grains: 20.0,
          vegetables: 5.0,
          fruits: 5.0,
          spices: 2.0,
        }),
        isActive: true,
      },
    });
  }

  return policy;
}

/**
 * Generates month key (e.g. "2026-08")
 */
function getMonthKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Finds or creates normalized AddressFingerprint in database
 */
async function getOrCreateAddressFingerprint(addressObj, tx = prisma) {
  const normalized = normalizeAddress(addressObj);

  let addressRecord = await tx.addressFingerprint.findUnique({
    where: { fingerprint: normalized.fingerprint },
  });

  if (!addressRecord) {
    addressRecord = await tx.addressFingerprint.create({
      data: {
        fingerprint: normalized.fingerprint,
        normalizedAddress: normalized.normalizedAddress,
        unitOrFlat: normalized.unitOrFlat,
        street: normalized.street,
        city: normalized.city,
        district: normalized.district,
        state: normalized.state,
        pincode: normalized.pincode,
        riskStatus: 'NORMAL',
        riskScore: 0,
      },
    });
  }

  return addressRecord;
}

/**
 * Re-evaluates risk score and status for a given address fingerprint
 */
async function evaluateAddressRiskScore(addressFingerprintId, tx = prisma) {
  const address = await tx.addressFingerprint.findUnique({
    where: { id: addressFingerprintId },
    include: {
      purchaseHistories: {
        where: { isCancelled: false },
        orderBy: { orderDate: 'desc' },
      },
      addresses: {
        include: {
          buyer: {
            include: {
              verification: true,
              user: true,
            },
          },
        },
      },
    },
  });

  if (!address) return null;

  const policy = await getActivePolicy();

  // 1. Count distinct buyer accounts linking to this address
  const uniqueBuyerIds = new Set();
  const uniqueAadhaarHashes = new Set();
  for (const addr of address.addresses) {
    if (addr.buyerId) uniqueBuyerIds.add(addr.buyerId);
    if (addr.buyer?.verification?.aadhaarHash) {
      uniqueAadhaarHashes.add(addr.buyer.verification.aadhaarHash);
    }
  }

  let riskScore = 0;
  const riskEvents = [];

  // Multi-account signal
  if (uniqueBuyerIds.size > 1) {
    const contribution = uniqueBuyerIds.size >= 3 ? 35 : 20;
    riskScore += contribution;
    riskEvents.push({
      eventType: 'MULTIPLE_ACCOUNTS_SAME_ADDRESS',
      scoreChange: contribution,
      details: `${uniqueBuyerIds.size} different customer accounts linked to this normalized address fingerprint.`,
    });
  }

  // Multiple Aadhaar identities on same address
  if (uniqueAadhaarHashes.size > 2) {
    const contribution = 20;
    riskScore += contribution;
    riskEvents.push({
      eventType: 'MULTIPLE_AADHAAR_IDENTITIES',
      scoreChange: contribution,
      details: `${uniqueAadhaarHashes.size} distinct Aadhaar verified identities sharing this address.`,
    });
  }

  // Monthly purchase volume signal
  const currentMonthKey = getMonthKey();
  const thisMonthHistories = address.purchaseHistories.filter((h) => h.monthKey === currentMonthKey);
  const monthlyTotalQty = thisMonthHistories.reduce((sum, h) => sum + h.quantity, 0);

  if (monthlyTotalQty > policy.addressMonthlyMaxKg * 1.5) {
    const contribution = 25;
    riskScore += contribution;
    riskEvents.push({
      eventType: 'EXCESSIVE_QUANTITY',
      scoreChange: contribution,
      details: `Monthly quantity of ${monthlyTotalQty.toFixed(1)} kg exceeds address quota limit of ${policy.addressMonthlyMaxKg} kg.`,
    });
  }

  // Order frequency (rapid successive orders within short interval)
  if (thisMonthHistories.length >= 2) {
    const recent = thisMonthHistories[0];
    const previous = thisMonthHistories[1];
    const hoursApart = Math.abs(new Date(recent.orderDate) - new Date(previous.orderDate)) / (1000 * 60 * 60);

    if (hoursApart < policy.shortIntervalHours && monthlyTotalQty >= policy.firstOrderLimitKg) {
      const contribution = 15;
      riskScore += contribution;
      riskEvents.push({
        eventType: 'SHORT_INTERVAL_ORDER',
        scoreChange: contribution,
        details: `Orders placed only ${hoursApart.toFixed(1)} hours apart with ${monthlyTotalQty.toFixed(1)} kg consumed this month.`,
      });
    }
  }

  // Bound risk score between 0 and 100
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine Risk Status based on thresholds
  let newStatus = 'NORMAL';
  if (riskScore >= policy.riskRestrictedThreshold) {
    newStatus = 'ADMIN_REVIEW';
  } else if (riskScore >= policy.riskWatchThreshold) {
    newStatus = 'RESTRICTED';
  } else if (riskScore >= policy.riskNormalThreshold) {
    newStatus = 'WATCH';
  }

  // Update address record
  const updatedAddress = await tx.addressFingerprint.update({
    where: { id: addressFingerprintId },
    data: {
      riskScore,
      riskStatus: address.isSuspended ? 'RESTRICTED' : newStatus,
      lastEvaluatedAt: new Date(),
    },
  });

  return {
    address: updatedAddress,
    riskScore,
    riskStatus: updatedAddress.riskStatus,
    uniqueBuyerAccounts: uniqueBuyerIds.size,
    monthlyTotalQty,
    riskEvents,
  };
}

/**
 * Validates purchase quotas, order limits and address constraints
 * Returns detailed evaluation for each item and overall permission status
 */
async function validateOrderPurchaseRestrictions({ buyerId, deliveryAddress, items }) {
  const policy = await getActivePolicy();
  const currentMonthKey = getMonthKey();

  // 1. Verify Buyer Profile & Customer Verification
  const buyer = await prisma.buyerProfile.findUnique({
    where: { id: buyerId },
    include: { verification: true, user: true },
  });

  if (!buyer) {
    const error = new Error('Customer account not found');
    error.status = 404;
    throw error;
  }

  // 2. Resolve Address Fingerprint
  const addressRecord = await getOrCreateAddressFingerprint(deliveryAddress);

  if (addressRecord.isSuspended) {
    return {
      allowed: false,
      action: 'BLOCKED',
      riskScore: 100,
      riskStatus: 'RESTRICTED',
      message: 'Delivery to this address is temporarily suspended. Please contact FARMDirect support.',
      itemsEvaluation: [],
    };
  }

  // 3. Fetch monthly purchase history for Customer and Address
  const customerHistories = await prisma.addressPurchaseHistory.findMany({
    where: {
      buyerId,
      monthKey: currentMonthKey,
      isCancelled: false,
    },
  });

  const addressHistories = await prisma.addressPurchaseHistory.findMany({
    where: {
      addressFingerprintId: addressRecord.id,
      monthKey: currentMonthKey,
      isCancelled: false,
    },
  });

  const customerTotalMonthQty = customerHistories.reduce((sum, h) => sum + h.quantity, 0);
  const customerOrdersCountThisMonth = customerHistories.length;

  const addressTotalMonthQty = addressHistories.reduce((sum, h) => sum + h.quantity, 0);
  const addressOrdersCountThisMonth = addressHistories.length;

  // Stricter evaluation per item
  let overallAllowed = true;
  let hasPartialRestriction = false;
  const itemsEvaluation = [];

  for (const item of items) {
    const requestedQty = parseFloat(item.quantity) || 0;
    const productId = item.productId;

    // Check product specific previous consumption
    const customerProductQty = customerHistories
      .filter((h) => h.productId === productId)
      .reduce((sum, h) => sum + h.quantity, 0);

    const addressProductQty = addressHistories
      .filter((h) => h.productId === productId)
      .reduce((sum, h) => sum + h.quantity, 0);

    // Calculate maximum applicable order limit:
    // If this customer or address has already ordered this month, subsequent order limit applies (e.g. 1 kg)
    const hasPreviousOrders = customerOrdersCountThisMonth > 0 || addressOrdersCountThisMonth > 0;
    const maxPerOrderLimit = hasPreviousOrders ? policy.subsequentOrderLimitKg : policy.firstOrderLimitKg;

    // Calculate remaining limits
    const customerRemaining = Math.max(0, policy.customerMonthlyMaxKg - customerTotalMonthQty);
    const addressRemaining = Math.max(0, policy.addressMonthlyMaxKg - addressTotalMonthQty);

    // If address is in RESTRICTED or WATCH mode due to multiple accounts or high orders, enforce subsequent limit strictly
    let effectiveOrderLimit = maxPerOrderLimit;
    if (addressRecord.riskStatus === 'RESTRICTED' || addressRecord.riskStatus === 'ADMIN_REVIEW') {
      effectiveOrderLimit = policy.subsequentOrderLimitKg;
    }

    // The stricter applicable limit
    const allowedQty = Math.max(
      0,
      Math.min(requestedQty, customerRemaining, addressRemaining, effectiveOrderLimit)
    );

    let status = 'ALLOW';
    let message = 'Purchase within permitted consumer quota.';

    if (allowedQty <= 0) {
      status = 'RESTRICTED';
      overallAllowed = false;
      message =
        'Your monthly purchase limit for this produce has been reached. Based on previous orders associated with this delivery address, no further quantity is available this month.';
    } else if (allowedQty < requestedQty) {
      status = 'PARTIAL_ALLOW';
      hasPartialRestriction = true;
      message = `Your monthly purchase limit for this produce has been reached. Based on previous orders associated with this delivery address, only ${allowedQty} ${item.unit || 'kg'} is currently available.`;
    }

    itemsEvaluation.push({
      productId,
      requestedQuantity: requestedQty,
      allowedQuantity: allowedQty,
      unit: item.unit || 'kg',
      status,
      message,
      customerRemainingMonthly: customerRemaining,
      addressRemainingMonthly: addressRemaining,
      orderLimitApplied: effectiveOrderLimit,
    });
  }

  // Calculate current risk status
  const riskEval = await evaluateAddressRiskScore(addressRecord.id);

  let finalAction = 'ALLOW';
  let bannerMessage = null;

  if (!overallAllowed || itemsEvaluation.some((i) => i.status === 'RESTRICTED')) {
    finalAction = 'RESTRICTED';
    bannerMessage =
      'One or more items in your cart exceed the monthly purchase quota configured for this delivery address.';
  } else if (hasPartialRestriction) {
    finalAction = 'PARTIAL_ALLOW';
    bannerMessage =
      'Purchase limits applied based on previous order activity. You can adjust your quantities to proceed.';
  }

  return {
    allowed: finalAction === 'ALLOW',
    action: finalAction,
    hasPartialRestriction,
    bannerMessage,
    customerSummary: {
      customerId: buyer.verification?.customerId || 'CUST-VERIFIED',
      maskedAadhaar: buyer.verification?.maskedAadhaar || 'Verified Identity',
      monthlyUsedKg: customerTotalMonthQty,
      monthlyMaxKg: policy.customerMonthlyMaxKg,
      ordersCountThisMonth: customerOrdersCountThisMonth,
    },
    addressSummary: {
      addressId: addressRecord.id,
      fingerprintPrefix: addressRecord.fingerprint.slice(0, 10),
      riskScore: riskEval?.riskScore || addressRecord.riskScore,
      riskStatus: riskEval?.riskStatus || addressRecord.riskStatus,
      monthlyUsedKg: addressTotalMonthQty,
      monthlyMaxKg: policy.addressMonthlyMaxKg,
    },
    itemsEvaluation,
  };
}

/**
 * Records purchase history upon confirmed order creation
 */
async function recordOrderPurchaseHistory(order, tx = prisma) {
  if (!order || !order.items) return;

  const currentMonthKey = getMonthKey(order.placedAt || new Date());
  const deliveryAddress = order.deliveryAddress;

  if (!deliveryAddress) return;

  // Ensure address fingerprint is created and linked
  const addressFingerprint = await getOrCreateAddressFingerprint(deliveryAddress, tx);

  // Link delivery address to fingerprint if not already set
  await tx.deliveryAddress.update({
    where: { id: deliveryAddress.id },
    data: { addressFingerprintId: addressFingerprint.id },
  });

  const buyer = await tx.buyerProfile.findUnique({
    where: { id: order.buyerId },
    include: { verification: true },
  });

  const customerId = buyer?.verification?.customerId || 'CUST-DIRECT';

  // Record history for each product item
  for (const item of order.items) {
    await tx.addressPurchaseHistory.create({
      data: {
        addressFingerprintId: addressFingerprint.id,
        buyerId: order.buyerId,
        customerId,
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit || 'kg',
        orderStatus: order.status || 'CONFIRMED',
        orderDate: order.placedAt || new Date(),
        monthKey: currentMonthKey,
        isCancelled: false,
      },
    });
  }

  // Update address risk score
  await evaluateAddressRiskScore(addressFingerprint.id, tx);
}

/**
 * Restores quota if an order is cancelled before dispatch or payment failed
 */
async function restoreOrderQuota(orderId, tx = prisma) {
  if (!orderId) return;

  await tx.addressPurchaseHistory.updateMany({
    where: { orderId },
    data: { isCancelled: true },
  });

  const sampleHistory = await tx.addressPurchaseHistory.findFirst({
    where: { orderId },
  });

  if (sampleHistory?.addressFingerprintId) {
    await evaluateAddressRiskScore(sampleHistory.addressFingerprintId, tx);
  }
}

module.exports = {
  getActivePolicy,
  getMonthKey,
  getOrCreateAddressFingerprint,
  evaluateAddressRiskScore,
  validateOrderPurchaseRestrictions,
  recordOrderPurchaseHistory,
  restoreOrderQuota,
};
