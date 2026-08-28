const assert = require('assert');
const prisma = require('../src/config/database');
const { normalizeAddress } = require('../src/utils/addressNormalizer');
const {
  initiateAadhaarOtp,
  verifyAadhaarOtp,
  hashAadhaar,
  maskAadhaar,
} = require('../src/services/identity/aadhaarService');
const {
  getActivePolicy,
  validateOrderPurchaseRestrictions,
  recordOrderPurchaseHistory,
  restoreOrderQuota,
  evaluateAddressRiskScore,
} = require('../src/services/restriction/purchaseRestrictionService');

async function runVerification() {
  console.log('===============================================================');
  console.log('STARTING FARMDIRECT CUSTOMER IDENTITY & RESTRICTION TEST SUITE');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Address Normalization & Fingerprinting
  // --------------------------------------------------------------------------
  console.log('[TEST 1] Testing Address Normalization & Fingerprinting...');
  const addrA = {
    addressLine1: '12, Anna Nagar',
    addressLine2: 'Near Bus Stand',
    city: 'Madurai',
    district: 'Madurai',
    state: 'Tamil Nadu',
    pincode: '625020',
  };

  const addrB = {
    addressLine1: '12 Anna Ngr',
    addressLine2: 'Nr Bus Stand',
    city: 'Madurai',
    district: 'Madurai',
    state: 'TN',
    pincode: '625020',
  };

  const normA = normalizeAddress(addrA);
  const normB = normalizeAddress(addrB);

  console.log('  Normalized A:', normA.normalizedAddress);
  console.log('  Normalized B:', normB.normalizedAddress);
  console.log('  Fingerprint A:', normA.fingerprint);
  console.log('  Fingerprint B:', normB.fingerprint);

  assert.strictEqual(normA.fingerprint, normB.fingerprint, 'Normalized address fingerprints MUST match!');
  console.log('  ✓ TEST 1 PASSED: Address normalization correctly generates identical fingerprints for formatted variants.\n');

  // --------------------------------------------------------------------------
  // TEST 2: Aadhaar OTP Flow & Irreversible Hashing
  // --------------------------------------------------------------------------
  console.log('[TEST 2] Testing Aadhaar OTP & Masking Flow...');
  const testAadhaar = '289145678901';
  const otpRes = await initiateAadhaarOtp({ aadhaarNumber: testAadhaar, mobile: '9842100001' });

  assert.strictEqual(otpRes.success, true);
  assert.strictEqual(otpRes.maskedAadhaar, 'XXXX-XXXX-8901');
  console.log('  OTP Initiated, Txn ID:', otpRes.txnId, 'Masked:', otpRes.maskedAadhaar);

  const verifyRes = await verifyAadhaarOtp({ txnId: otpRes.txnId, otp: '123456' });
  assert.strictEqual(verifyRes.success, true);
  assert.strictEqual(verifyRes.verificationStatus, 'VERIFIED');
  assert.ok(verifyRes.verificationToken);
  assert.ok(verifyRes.customerId.startsWith('CUST-'));
  console.log('  ✓ Verified Identity Token Generated:', verifyRes.verificationToken, 'Customer ID:', verifyRes.customerId);
  console.log('  ✓ TEST 2 PASSED: Aadhaar OTP verified securely without storing raw number.\n');

  // --------------------------------------------------------------------------
  // TEST 3: Setup Test Farmer, Product, and Policy
  // --------------------------------------------------------------------------
  console.log('[TEST 3] Initializing Test Fixtures in Database...');
  const policy = await getActivePolicy();
  console.log(`  Active Policy: FirstOrderLimit=${policy.firstOrderLimitKg}kg, SubsequentLimit=${policy.subsequentOrderLimitKg}kg, MonthlyMax=${policy.addressMonthlyMaxKg}kg`);

  // Find or create test product
  let product = await prisma.product.findFirst({
    where: { isActive: true },
    include: { farmer: true },
  });

  if (!product) {
    const user = await prisma.user.findFirst({ where: { role: 'FARMER' } });
    const farmer = await prisma.farmerProfile.findFirst({ where: { userId: user.id } });
    const cat = await prisma.productCategory.findFirst();
    product = await prisma.product.create({
      data: {
        farmerId: farmer.id,
        categoryId: cat.id,
        name: 'Organic Red Tomatoes',
        unit: 'kg',
        farmerPrice: 35,
        isActive: true,
        inventory: { create: { availableQty: 500, reservedQty: 0 } },
      },
      include: { farmer: true },
    });
  }

  console.log(`  Test Product: ${product.name} (Farmer ID: ${product.farmerId})\n`);

  // --------------------------------------------------------------------------
  // TEST 4: Customer 1 First Order (5 kg) -> Allowed
  // --------------------------------------------------------------------------
  console.log('[TEST 4] Testing Customer 1 First Monthly Purchase (5 kg)...');
  const user1Email = `cust1_${Date.now()}@test.com`;
  const user1Phone = `98421${Math.floor(10000 + Math.random() * 90000)}`;
  const cust1Aadhaar = `2891${Math.floor(10000000 + Math.random() * 90000000)}`;

  const user1 = await prisma.user.create({
    data: {
      name: 'Ravi Kumar',
      email: user1Email,
      phone: user1Phone,
      passwordHash: 'hash123',
      role: 'BUYER',
    },
  });

  const buyer1 = await prisma.buyerProfile.create({
    data: {
      userId: user1.id,
      buyerType: 'INDIVIDUAL',
    },
  });

  await prisma.customerVerification.create({
    data: {
      buyerId: buyer1.id,
      customerId: `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
      verificationStatus: 'VERIFIED',
      aadhaarHash: hashAadhaar(cust1Aadhaar),
      maskedAadhaar: maskAadhaar(cust1Aadhaar),
      verifiedMobile: user1Phone,
    },
  });

  const testRunTag = Date.now();
  const sharedAddress = {
    addressLine1: `Flat 4B, Emerald Heights, Anna Salai #${testRunTag}`,
    addressLine2: 'T Nagar',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
  };

  // Validate Customer 1 ordering 5 kg
  const valCust1 = await validateOrderPurchaseRestrictions({
    buyerId: buyer1.id,
    deliveryAddress: sharedAddress,
    items: [{ productId: product.id, quantity: 5.0, unit: 'kg' }],
  });

  console.log('  Customer 1 Evaluation Action:', valCust1.action, 'Allowed:', valCust1.allowed);
  assert.strictEqual(valCust1.allowed, true, 'Customer 1 first order of 5kg should be ALLOWED');
  assert.strictEqual(valCust1.itemsEvaluation[0].allowedQuantity, 5.0);

  // Simulate Order 1 Confirmation & Record History
  const dAddress = await prisma.deliveryAddress.create({
    data: {
      buyerId: buyer1.id,
      label: 'Home',
      addressLine1: sharedAddress.addressLine1,
      addressLine2: sharedAddress.addressLine2,
      city: sharedAddress.city,
      district: sharedAddress.district,
      state: sharedAddress.state,
      pincode: sharedAddress.pincode,
    },
  });

  const order1 = await prisma.order.create({
    data: {
      orderNumber: `FD-TEST-${Date.now()}`,
      buyerId: buyer1.id,
      deliveryAddressId: dAddress.id,
      status: 'CONFIRMED',
      totalFarmerAmount: 175,
      totalCharges: 45,
      totalAmount: 220,
      placedAt: new Date(),
      items: {
        create: [
          {
            productId: product.id,
            quantity: 5.0,
            unit: 'kg',
            farmerPrice: 35,
            customerPrice: 44,
            totalFarmerAmount: 175,
            totalCustomerAmount: 220,
          },
        ],
      },
    },
    include: { deliveryAddress: true, items: true },
  });

  await recordOrderPurchaseHistory(order1);
  console.log('  ✓ Order 1 recorded to address purchase history.');
  console.log('  ✓ TEST 4 PASSED: First order of 5 kg successfully permitted and logged.\n');

  // --------------------------------------------------------------------------
  // TEST 5: Customer 2 (Different Aadhaar) Attempting 5 kg to SAME Address
  // --------------------------------------------------------------------------
  console.log('[TEST 5] Testing Customer 2 (Different Aadhaar) Attempting 5 kg to SAME Address...');
  const user2Email = `cust2_${Date.now()}@test.com`;
  const user2Phone = `98422${Math.floor(10000 + Math.random() * 90000)}`;
  const cust2Aadhaar = `2892${Math.floor(10000000 + Math.random() * 90000000)}`;

  const user2 = await prisma.user.create({
    data: {
      name: 'Priya Kumar',
      email: user2Email,
      phone: user2Phone,
      passwordHash: 'hash123',
      role: 'BUYER',
    },
  });

  const buyer2 = await prisma.buyerProfile.create({
    data: {
      userId: user2.id,
      buyerType: 'INDIVIDUAL',
    },
  });

  await prisma.customerVerification.create({
    data: {
      buyerId: buyer2.id,
      customerId: `CUST-${Math.floor(100000 + Math.random() * 900000)}`,
      verificationStatus: 'VERIFIED',
      aadhaarHash: hashAadhaar(cust2Aadhaar),
      maskedAadhaar: maskAadhaar(cust2Aadhaar),
      verifiedMobile: user2Phone,
    },
  });

  // Customer 2 uses SAME address with slight formatting difference
  const sharedAddressVariant = {
    addressLine1: `Flat 4B Emerald Heights Anna Salai no ${testRunTag}`,
    addressLine2: 'T. Nagar',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
  };

  const valCust2 = await validateOrderPurchaseRestrictions({
    buyerId: buyer2.id,
    deliveryAddress: sharedAddressVariant,
    items: [{ productId: product.id, quantity: 5.0, unit: 'kg' }],
  });

  console.log('  Customer 2 Evaluation Action:', valCust2.action);
  console.log('  Requested Quantity:', valCust2.itemsEvaluation[0].requestedQuantity, 'kg');
  console.log('  Allowed Quantity:', valCust2.itemsEvaluation[0].allowedQuantity, 'kg');
  console.log('  Message returned to user:', valCust2.itemsEvaluation[0].message);

  assert.strictEqual(valCust2.action, 'PARTIAL_ALLOW', 'Customer 2 must be partially restricted due to previous address activity');
  assert.strictEqual(valCust2.itemsEvaluation[0].allowedQuantity, 1.0, 'Allowed quantity must be capped at subsequent order limit (1 kg)!');
  assert.ok(valCust2.itemsEvaluation[0].message.includes('1 kg is currently available'));
  console.log('  ✓ TEST 5 PASSED: Address-level purchase limit successfully enforced on secondary account!\n');

  // --------------------------------------------------------------------------
  // TEST 6: Address Risk Score Elevation on Multi-Account Activity
  // --------------------------------------------------------------------------
  console.log('[TEST 6] Testing Address Risk Score Elevation...');
  const addrFingerprint = await prisma.addressFingerprint.findFirst({
    where: { normalizedAddress: normalizeAddress(sharedAddress).normalizedAddress },
  });

  assert.ok(addrFingerprint, 'Address fingerprint must exist in database');

  // Customer 2 places the allowed 1 kg order
  const dAddress2 = await prisma.deliveryAddress.create({
    data: {
      buyerId: buyer2.id,
      label: 'Home',
      addressFingerprintId: addrFingerprint.id,
      addressLine1: sharedAddressVariant.addressLine1,
      addressLine2: sharedAddressVariant.addressLine2,
      city: sharedAddressVariant.city,
      district: sharedAddressVariant.district,
      state: sharedAddressVariant.state,
      pincode: sharedAddressVariant.pincode,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: `FD-TEST-2-${Date.now()}`,
      buyerId: buyer2.id,
      deliveryAddressId: dAddress2.id,
      status: 'CONFIRMED',
      totalFarmerAmount: 35,
      totalCharges: 9,
      totalAmount: 44,
      placedAt: new Date(),
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1.0,
            unit: 'kg',
            farmerPrice: 35,
            customerPrice: 44,
            totalFarmerAmount: 35,
            totalCustomerAmount: 44,
          },
        ],
      },
    },
    include: { deliveryAddress: true, items: true },
  });

  await recordOrderPurchaseHistory(order2);

  const riskEval = await evaluateAddressRiskScore(addrFingerprint.id);

  console.log('  Address Risk Score:', riskEval.riskScore);
  console.log('  Address Risk Status:', riskEval.riskStatus);
  console.log('  Associated Accounts Detected:', riskEval.uniqueBuyerAccounts);

  assert.ok(riskEval.uniqueBuyerAccounts >= 2, 'Must detect at least 2 accounts sharing address');
  assert.ok(riskEval.riskScore > 0, 'Risk score must be elevated when multi-account cluster is detected');
  console.log('  ✓ TEST 6 PASSED: Risk engine properly elevated risk score on shared physical address.\n');

  // --------------------------------------------------------------------------
  // TEST 7: Order Cancellation & Quota Restoration
  // --------------------------------------------------------------------------
  console.log('[TEST 7] Testing Order Cancellation & Quota Restoration...');
  await restoreOrderQuota(order1.id);
  await restoreOrderQuota(order2.id);

  const historyAfterCancel1 = await prisma.addressPurchaseHistory.findFirst({
    where: { orderId: order1.id },
  });
  const historyAfterCancel2 = await prisma.addressPurchaseHistory.findFirst({
    where: { orderId: order2.id },
  });

  assert.strictEqual(historyAfterCancel1.isCancelled, true, 'Purchase history 1 must be marked cancelled');
  assert.strictEqual(historyAfterCancel2.isCancelled, true, 'Purchase history 2 must be marked cancelled');

  // Re-check Customer 1 quota after cancellation
  const valCust1After = await validateOrderPurchaseRestrictions({
    buyerId: buyer1.id,
    deliveryAddress: sharedAddress,
    items: [{ productId: product.id, quantity: 5.0, unit: 'kg' }],
  });

  console.log('  Customer 1 Allowed Quantity after order cancellation:', valCust1After.itemsEvaluation[0].allowedQuantity, 'kg');
  assert.strictEqual(valCust1After.itemsEvaluation[0].allowedQuantity, 5.0, 'Quota must be fully restored upon order cancellation!');
  console.log('  ✓ TEST 7 PASSED: Quota successfully restored upon cancellation.\n');

  console.log('===============================================================');
  console.log('ALL 7 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('===============================================================');
}

runVerification()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('TEST FAILED:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
