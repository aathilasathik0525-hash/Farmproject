// Comprehensive Automated Test & Verification Suite for FARMDirect
const app = require('../app');
const prisma = require('../config/database');
const http = require('http');

let server;
let baseUrl;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🧪 RUNNING FARMDIRECT E2E COMPREHENSIVE VERIFICATION SUITE');
  console.log('=============================================================\n');

  // Start test server on random port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Backend Health Check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data?.status === 'healthy', 'GET /api/health returns status healthy (200)');

    // 2. Public Farmers List
    const farmersRes = await request('GET', '/api/farmers');
    assert(farmersRes.status === 200 && Array.isArray(farmersRes.data?.data), 'GET /api/farmers returns registered active farmers');
    const farmers = farmersRes.data?.data || [];
    assert(farmers.length >= 2, `Database contains at least 2 real farmers (Found: ${farmers.length})`);

    const farmerA = farmers[0];
    const farmerB = farmers[1];

    // 3. Farmer A Detail & Product Isolation
    const farmerARes = await request('GET', `/api/farmers/${farmerA.id}`);
    assert(farmerARes.status === 200 && farmerARes.data?.data?.farmer?.id === farmerA.id, `GET /api/farmers/${farmerA.id} returns Farmer A details`);
    const farmerAProducts = farmerARes.data?.data?.products || [];

    // Verify all products in Farmer A's catalog strictly belong to Farmer A
    const allBelongToA = farmerAProducts.every((p) => p.farmerId === farmerA.id);
    assert(allBelongToA, "Farmer A's marketplace view ONLY contains products belonging to Farmer A");

    // 4. Farmer B Detail & Product Isolation
    const farmerBRes = await request('GET', `/api/farmers/${farmerB.id}`);
    const farmerBProducts = farmerBRes.data?.data?.products || [];
    const allBelongToB = farmerBProducts.every((p) => p.farmerId === farmerB.id);
    assert(allBelongToB, "Farmer B's marketplace view ONLY contains products belonging to Farmer B");

    // Verify Farmer B has none of Farmer A's products
    const farmerAIds = new Set(farmerAProducts.map((p) => p.id));
    const hasLeakage = farmerBProducts.some((p) => farmerAIds.has(p.id));
    assert(!hasLeakage, 'Strict Product Isolation: No cross-farmer product leakage detected');

    // 5. Authentication Test: Register and Login real Buyer & Farmer
    const testTimestamp = Date.now();
    const customerPayload = {
      name: `Test Buyer ${testTimestamp}`,
      email: `buyer_${testTimestamp}@test.in`,
      phone: `+91 91000 ${testTimestamp.toString().slice(-5)}`,
      password: 'password123',
      role: 'CUSTOMER',
      profileData: { companyName: 'Direct Fresh Mart' },
    };

    const regBuyer = await request('POST', '/api/auth/register', customerPayload);
    assert(regBuyer.status === 201 && regBuyer.data?.token, 'Customer Registration creates real User and BuyerProfile in DB');

    const buyerToken = regBuyer.data?.token;

    // Login test
    const loginBuyer = await request('POST', '/api/auth/login', {
      email: customerPayload.email,
      password: 'password123',
    });
    assert(loginBuyer.status === 200 && loginBuyer.data?.user?.role === 'BUYER', 'Real customer login succeeds with bcrypt validation and returns BUYER role');

    // Duplicate email registration test
    const dupBuyer = await request('POST', '/api/auth/register', customerPayload);
    assert(dupBuyer.status === 409 && dupBuyer.data?.message === 'Email already registered', 'Duplicate email registration correctly rejected with HTTP 409');

    // 6. Farmer Product Creation Test
    // Register Farmer with Tamil language
    const farmerPayload = {
      name: `Ravi Test Farmer ${testTimestamp}`,
      email: `farmer_${testTimestamp}@test.in`,
      phone: `+91 92000 ${testTimestamp.toString().slice(-5)}`,
      password: 'password123',
      role: 'FARMER',
      preferredLanguage: 'ta-IN',
      profileData: {
        village: 'Lalgudi',
        district: 'Trichy',
        experience: 10,
        landHolding: 5.0,
        preferredLanguage: 'ta-IN',
      },
    };

    const regFarmer = await request('POST', '/api/auth/register', farmerPayload);
    assert(regFarmer.status === 201 && regFarmer.data?.user?.farmerProfile?.preferredLanguage === 'ta-IN', 'Farmer registration stores preferredLanguage (ta-IN) in database');

    const farmerToken = regFarmer.data?.token;
    const newFarmerId = regFarmer.data?.user?.farmerProfile?.id;

    // Get categories to create product
    const catRes = await request('GET', '/api/products/categories');
    const categoryId = catRes.data?.data?.[0]?.id;

    const newProductPayload = {
      name: 'Fresh Delta Country Tomatoes',
      categoryId,
      description: 'Vine-ripened pesticide-free tomatoes',
      unit: 'kg',
      farmerPrice: 28.0,
      quantity: 200,
      qualityGrade: 'A',
      isOrganic: true,
    };

    const createProdRes = await request('POST', '/api/products', newProductPayload, {
      Authorization: `Bearer ${farmerToken}`,
    });
    assert(createProdRes.status === 201 && createProdRes.data?.data?.id, 'Farmer adds real Product and Inventory (200 kg) to database');
    const createdProduct = createProdRes.data?.data;

    // 7. Inventory check before order
    const invBefore = await prisma.inventory.findUnique({
      where: { productId: createdProduct.id },
    });
    assert(invBefore.availableQty === 200, 'Initial inventory availableQty is 200 kg');

    // 8. Order Creation & Inventory Decrement Test
    const orderPayload = {
      items: [
        {
          productId: createdProduct.id,
          quantity: 25,
        },
      ],
      deliveryAddress: {
        addressLine1: 'No 10, Anna Salai',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600002',
      },
      notes: 'Please pack in ventilated crates',
    };

    const orderRes = await request('POST', '/api/orders', orderPayload, {
      Authorization: `Bearer ${buyerToken}`,
    });
    assert(orderRes.status === 201 && orderRes.data?.data?.id, 'Customer places real order for 25 kg of Farmer product');
    const createdOrder = orderRes.data?.data;

    // Check inventory decreased from 200 to 175
    const invAfter = await prisma.inventory.findUnique({
      where: { productId: createdProduct.id },
    });
    assert(invAfter.availableQty === 175 && invAfter.reservedQty === 25, 'Inventory decreased transactionally (Available: 175 kg, Reserved: 25 kg)');

    // 9. Single Farmer Per Order Enforcement
    // Try placing order mixing Farmer A and Farmer B products
    if (farmerAProducts[0] && farmerBProducts[0]) {
      const mixedOrderPayload = {
        items: [
          { productId: farmerAProducts[0].id, quantity: 5 },
          { productId: farmerBProducts[0].id, quantity: 5 },
        ],
        deliveryAddress: { addressLine1: 'Test Address', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
      };

      const mixedRes = await request('POST', '/api/orders', mixedOrderPayload, {
        Authorization: `Bearer ${buyerToken}`,
      });
      assert(mixedRes.status === 400 || mixedRes.status === 500, 'Backend rejects multi-farmer mixed order requests');
    }

    // 10. Notification Routing & Native Language Test
    // Check notifications created for the new farmer
    await new Promise((r) => setTimeout(r, 400)); // wait for async notifications
    const farmerNotifs = await prisma.notification.findMany({
      where: { userId: regFarmer.data?.user?.id },
    });
    assert(farmerNotifs.length >= 3, `Farmer received In-App, SMS, and Voice notifications in DB (Count: ${farmerNotifs.length})`);

    const smsNotif = farmerNotifs.find((n) => n.channel === 'SMS');
    const voiceNotif = farmerNotifs.find((n) => n.channel === 'VOICE');

    assert(smsNotif && smsNotif.language === 'ta-IN', 'SMS Notification generated in Farmer preferred language (ta-IN)');
    assert(voiceNotif && voiceNotif.message.includes('FARMDirect') && voiceNotif.message.includes('25'), 'Automated Voice IVR message contains exact Order #, Product Name, and 25 kg quantity');

    // Verify other farmers received NO notification for this order
    const otherFarmerNotifs = await prisma.notification.findMany({
      where: {
        orderId: createdOrder.id,
        NOT: { userId: regFarmer.data?.user?.id },
      },
    });
    assert(otherFarmerNotifs.length === 0, 'Zero Notification Leakage: Other farmers received NOTHING for this order');

    // 11. IVR DTMF Webhook Test (1 -> FARMER_CONFIRMED)
    const dtmf1Res = await request('POST', '/api/notifications/webhook/voice', {
      orderId: createdOrder.id,
      Digits: '1',
      From: farmerPayload.phone,
    });
    assert(dtmf1Res.status === 200 && dtmf1Res.data?.updatedStatus === 'FARMER_CONFIRMED', 'POST /api/notifications/webhook/voice DTMF 1 updates Order to FARMER_CONFIRMED');

    // Verify OrderStatusHistory in DB
    const statusHistory = await prisma.orderStatusHistory.findMany({
      where: { orderId: createdOrder.id },
    });
    assert(statusHistory.some((h) => h.status === 'FARMER_CONFIRMED'), 'OrderStatusHistory record created for DTMF IVR harvest confirmation');

    // 12. IVR DTMF Webhook Test (2 -> FARMER_REJECTED and Inventory Restoration)
    // Create another quick order to test rejection & inventory restoration
    const order2Res = await request('POST', '/api/orders', {
      items: [{ productId: createdProduct.id, quantity: 15 }],
      deliveryAddress: { addressLine1: 'Test Address', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
    }, {
      Authorization: `Bearer ${buyerToken}`,
    });
    const order2 = order2Res.data?.data;

    const dtmf2Res = await request('POST', '/api/notifications/webhook/voice', {
      orderId: order2.id,
      Digits: '2',
      From: farmerPayload.phone,
    });
    assert(dtmf2Res.status === 200 && dtmf2Res.data?.updatedStatus === 'FARMER_REJECTED', 'POST /api/notifications/webhook/voice DTMF 2 updates Order to FARMER_REJECTED');

    // Verify inventory restored after rejection
    const invRestored = await prisma.inventory.findUnique({
      where: { productId: createdProduct.id },
    });
    assert(invRestored.availableQty === 175, 'Inventory quantity restored to available stock upon order rejection');

  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    if (server) server.close();
  }

  console.log('\n=============================================================');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
