const prisma = require('../config/database');
const {
  getActivePolicy,
  evaluateAddressRiskScore,
  getMonthKey,
} = require('../services/restriction/purchaseRestrictionService');

// GET /api/admin/risk/addresses
const getAddressRiskList = async (req, res, next) => {
  try {
    const currentMonthKey = getMonthKey();

    const addresses = await prisma.addressFingerprint.findMany({
      include: {
        addresses: {
          include: {
            buyer: {
              include: {
                verification: {
                  select: {
                    customerId: true,
                    maskedAadhaar: true,
                    verificationStatus: true,
                  },
                },
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        purchaseHistories: {
          where: {
            isCancelled: false,
          },
        },
        adminReviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [
        { riskScore: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    const formatted = addresses.map((addr) => {
      // Aggregate distinct accounts
      const accountsMap = new Map();
      for (const dAddr of addr.addresses) {
        if (dAddr.buyer) {
          accountsMap.set(dAddr.buyer.id, {
            buyerId: dAddr.buyer.id,
            name: dAddr.buyer.user?.name || 'Customer',
            customerId: dAddr.buyer.verification?.customerId || 'CUST-UNKNOWN',
            maskedAadhaar: dAddr.buyer.verification?.maskedAadhaar || 'XXXX-XXXX-XXXX',
            verificationStatus: dAddr.buyer.verification?.verificationStatus || 'VERIFIED',
          });
        }
      }

      // Calculate monthly volume
      const thisMonthHistories = addr.purchaseHistories.filter((h) => h.monthKey === currentMonthKey);
      const monthlyQuantityKg = thisMonthHistories.reduce((sum, h) => sum + h.quantity, 0);
      const totalOrdersCount = addr.purchaseHistories.length;

      return {
        id: addr.id,
        fingerprint: addr.fingerprint,
        fingerprintShort: addr.fingerprint.slice(0, 12),
        normalizedAddress: addr.normalizedAddress,
        unitOrFlat: addr.unitOrFlat,
        city: addr.city,
        district: addr.district,
        state: addr.state,
        pincode: addr.pincode,
        riskScore: addr.riskScore,
        riskStatus: addr.riskStatus,
        isSuspended: addr.isSuspended,
        adminNotes: addr.adminNotes,
        lastEvaluatedAt: addr.lastEvaluatedAt,
        accountsCount: accountsMap.size,
        accounts: Array.from(accountsMap.values()),
        monthlyQuantityKg,
        totalOrdersCount,
        latestReview: addr.adminReviews[0] || null,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/risk/addresses/:id
const getAddressDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await prisma.addressFingerprint.findUnique({
      where: { id },
      include: {
        addresses: {
          include: {
            buyer: {
              include: {
                verification: {
                  select: {
                    customerId: true,
                    maskedAadhaar: true,
                    verificationStatus: true,
                    verifiedAt: true,
                  },
                },
                user: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
        purchaseHistories: {
          orderBy: { orderDate: 'desc' },
        },
        riskEvents: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        adminReviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address identity record not found' });
    }

    res.json({
      success: true,
      data: address,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/risk/addresses/:id/status
const updateAddressStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, note, riskStatus, isSuspended } = req.body;

    const currentAddress = await prisma.addressFingerprint.findUnique({
      where: { id },
    });

    if (!currentAddress) {
      return res.status(404).json({ success: false, message: 'Address identity record not found' });
    }

    const previousStatus = currentAddress.riskStatus;
    let newStatus = riskStatus || previousStatus;
    let newSuspended = isSuspended !== undefined ? isSuspended : currentAddress.isSuspended;

    if (action === 'APPROVE') {
      newStatus = 'NORMAL';
      newSuspended = false;
    } else if (action === 'RESTRICT') {
      newStatus = 'RESTRICTED';
    } else if (action === 'SUSPEND') {
      newStatus = 'RESTRICTED';
      newSuspended = true;
    } else if (action === 'UNSUSPEND') {
      newSuspended = false;
      newStatus = 'WATCH';
    }

    const updated = await prisma.$transaction(async (tx) => {
      const addr = await tx.addressFingerprint.update({
        where: { id },
        data: {
          riskStatus: newStatus,
          isSuspended: newSuspended,
          adminNotes: note ? `${note} (by ${req.user.name})` : currentAddress.adminNotes,
          updatedAt: new Date(),
        },
      });

      await tx.adminReview.create({
        data: {
          addressFingerprintId: id,
          adminUserId: req.user.id,
          action: action || 'STATUS_UPDATE',
          note: note || `Status modified to ${newStatus}`,
          previousStatus,
          newStatus,
        },
      });

      return addr;
    });

    res.json({
      success: true,
      message: `Address risk status updated to ${newStatus}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/risk/policy
const getPolicy = async (req, res, next) => {
  try {
    const policy = await getActivePolicy();
    res.json({
      success: true,
      data: policy,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/risk/policy
const updatePolicy = async (req, res, next) => {
  try {
    const {
      firstOrderLimitKg,
      subsequentOrderLimitKg,
      customerMonthlyMaxKg,
      addressMonthlyMaxKg,
      shortIntervalHours,
      riskNormalThreshold,
      riskWatchThreshold,
      riskRestrictedThreshold,
      categoryLimitsJson,
    } = req.body;

    const currentPolicy = await getActivePolicy();

    const updated = await prisma.purchaseQuotaPolicy.update({
      where: { id: currentPolicy.id },
      data: {
        firstOrderLimitKg: firstOrderLimitKg !== undefined ? parseFloat(firstOrderLimitKg) : currentPolicy.firstOrderLimitKg,
        subsequentOrderLimitKg: subsequentOrderLimitKg !== undefined ? parseFloat(subsequentOrderLimitKg) : currentPolicy.subsequentOrderLimitKg,
        customerMonthlyMaxKg: customerMonthlyMaxKg !== undefined ? parseFloat(customerMonthlyMaxKg) : currentPolicy.customerMonthlyMaxKg,
        addressMonthlyMaxKg: addressMonthlyMaxKg !== undefined ? parseFloat(addressMonthlyMaxKg) : currentPolicy.addressMonthlyMaxKg,
        shortIntervalHours: shortIntervalHours !== undefined ? parseInt(shortIntervalHours) : currentPolicy.shortIntervalHours,
        riskNormalThreshold: riskNormalThreshold !== undefined ? parseFloat(riskNormalThreshold) : currentPolicy.riskNormalThreshold,
        riskWatchThreshold: riskWatchThreshold !== undefined ? parseFloat(riskWatchThreshold) : currentPolicy.riskWatchThreshold,
        riskRestrictedThreshold: riskRestrictedThreshold !== undefined ? parseFloat(riskRestrictedThreshold) : currentPolicy.riskRestrictedThreshold,
        categoryLimitsJson: categoryLimitsJson !== undefined ? (typeof categoryLimitsJson === 'string' ? categoryLimitsJson : JSON.stringify(categoryLimitsJson)) : currentPolicy.categoryLimitsJson,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Purchase quota & risk policy updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAddressRiskList,
  getAddressDetails,
  updateAddressStatus,
  getPolicy,
  updatePolicy,
};
