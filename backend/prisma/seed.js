const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FarmDirect Database with authentic Indian agricultural data...');

  // Clean existing records in dependency order
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.farmerEarning.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.aggregationItem.deleteMany();
  await prisma.aggregation.deleteMany();
  await prisma.payment.deleteMany();
  // Clean restriction/identity tables
  await prisma.adminReview.deleteMany();
  await prisma.riskEvent.deleteMany();
  await prisma.addressPurchaseHistory.deleteMany();
  await prisma.purchaseQuotaPolicy.deleteMany();
  await prisma.customerVerification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.addressFingerprint.deleteMany();
  await prisma.deliveryAddress.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.collectionCenter.deleteMany();
  await prisma.fPOProfile.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.logisticsProfile.deleteMany();
  await prisma.fPO.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Product Categories
  const catFruits = await prisma.productCategory.create({
    data: { name: 'Fruits', slug: 'fruits', icon: '🍎' },
  });
  const catVegetables = await prisma.productCategory.create({
    data: { name: 'Vegetables', slug: 'vegetables', icon: '🥬' },
  });
  const catGrains = await prisma.productCategory.create({
    data: { name: 'Grains', slug: 'grains', icon: '🌾' },
  });
  const catPulses = await prisma.productCategory.create({
    data: { name: 'Pulses', slug: 'pulses', icon: '🫘' },
  });
  const catSpices = await prisma.productCategory.create({
    data: { name: 'Spices', slug: 'spices', icon: '🌶️' },
  });
  const catOther = await prisma.productCategory.create({
    data: { name: 'Other', slug: 'other', icon: '📦' },
  });

  console.log('✅ Categories created');

  // 2. Create FPOs
  const fpoTrichy = await prisma.fPO.create({
    data: {
      name: 'Trichy Farmer Producer Company Ltd.',
      registrationNumber: 'FPO-TN-TR-2021-084',
      district: 'Trichy',
      state: 'Tamil Nadu',
      contactPhone: '+91 98421 12345',
      contactEmail: 'contact@trichyfpo.org',
      address: 'Agri Hub Complex, Cantonment, Trichy, Tamil Nadu 620001',
      gpsLat: 10.7905,
      gpsLng: 78.7047,
    },
  });

  const fpoMadurai = await prisma.fPO.create({
    data: {
      name: 'Madurai Organic Farmers Cooperative',
      registrationNumber: 'FPO-TN-MD-2022-102',
      district: 'Madurai',
      state: 'Tamil Nadu',
      contactPhone: '+91 94432 54321',
      contactEmail: 'info@maduraiorganic.org',
      address: 'Market Yard, Mattuthavani, Madurai, Tamil Nadu 625007',
      gpsLat: 9.9252,
      gpsLng: 78.1198,
    },
  });

  // Collection Centers for FPOs
  const centerTrichy = await prisma.collectionCenter.create({
    data: {
      fpoId: fpoTrichy.id,
      name: 'Trichy Central Agri Aggregation Hub',
      address: 'Gate 3, SIPCOT Industrial Growth Center, Trichy',
      district: 'Trichy',
      capacity: 120, // tonnes
      gpsLat: 10.8012,
      gpsLng: 78.6894,
    },
  });

  const centerMadurai = await prisma.collectionCenter.create({
    data: {
      fpoId: fpoMadurai.id,
      name: 'Madurai Rural Produce Center',
      address: 'Melur Road, Near Toll Plaza, Madurai',
      district: 'Madurai',
      capacity: 80,
      gpsLat: 9.9401,
      gpsLng: 78.1523,
    },
  });

  console.log('✅ FPOs and Collection Centers created');

  // 3. Create Demo Users & Profiles

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'Dr. S. Ramanathan',
      email: 'admin@farmdirect.in',
      phone: '+91 98765 00001',
      passwordHash: defaultPassword,
      role: 'ADMIN',
    },
  });

  // FPO Officer User
  const fpoUser = await prisma.user.create({
    data: {
      name: 'K. Balasubramanian',
      email: 'fpo@farmdirect.in',
      phone: '+91 98421 12345',
      passwordHash: defaultPassword,
      role: 'FPO',
      fpoProfile: {
        create: {
          fpoId: fpoTrichy.id,
          designation: 'Chief Aggregation Officer',
        },
      },
    },
  });

  // Logistics User
  const logisticsUser = await prisma.user.create({
    data: {
      name: 'Murugan Transport Logistics',
      email: 'logistics@farmdirect.in',
      phone: '+91 98940 33445',
      passwordHash: defaultPassword,
      role: 'LOGISTICS',
      logisticsProfile: {
        create: {
          companyName: 'Tamil Nadu Agri Express Logistics',
          licenseNumber: 'TN-LOG-2023-8899',
        },
      },
    },
    include: { logisticsProfile: true },
  });

  // Vehicles for logistics
  const vehicle1 = await prisma.vehicle.create({
    data: {
      logisticsId: logisticsUser.logisticsProfile.id,
      registrationNumber: 'TN-45-AZ-2345',
      type: 'TRUCK',
      capacityTonnes: 5.5,
      driverName: 'P. Murugesan',
      driverPhone: '+91 98940 33445',
      isAvailable: true,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      logisticsId: logisticsUser.logisticsProfile.id,
      registrationNumber: 'TN-48-M-7890',
      type: 'MINI_TRUCK',
      capacityTonnes: 2.0,
      driverName: 'S. Selvam',
      driverPhone: '+91 97890 12345',
      isAvailable: true,
    },
  });

  // Customer/Buyer User
  const buyerUser = await prisma.user.create({
    data: {
      name: 'Priya Sundaram',
      email: 'buyer@farmdirect.in',
      phone: '+91 98400 98765',
      passwordHash: defaultPassword,
      role: 'BUYER',
      buyerProfile: {
        create: {
          companyName: 'Sundaram Organics & Fresh Mart',
          buyerType: 'BUSINESS',
        },
      },
    },
    include: { buyerProfile: true },
  });

  // Customer Delivery Address
  const buyerAddress = await prisma.deliveryAddress.create({
    data: {
      buyerId: buyerUser.buyerProfile.id,
      label: 'Main Store & Warehouse',
      addressLine1: 'No. 42, Anna Salai, T. Nagar',
      addressLine2: 'Near Panagal Park',
      city: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      isDefault: true,
      gpsLat: 13.0418,
      gpsLng: 80.2341,
    },
  });

  console.log('✅ Admin, FPO, Logistics, and Buyer created');

  // 4. Create Farmers & Profiles
  const farmer1User = await prisma.user.create({
    data: {
      name: 'Ravi Kumar',
      email: 'farmer@farmdirect.in', // Primary demo farmer account
      phone: '+91 98421 67890',
      passwordHash: defaultPassword,
      role: 'FARMER',
      farmerProfile: {
        create: {
          farmName: 'Cauvery Delta Organic Green Farms',
          village: 'Lalgudi',
          district: 'Trichy',
          state: 'Tamil Nadu',
          pincode: '621601',
          experience: 12,
          landHolding: 4.5,
          verificationStatus: 'VERIFIED',
          bio: 'Practicing sustainable natural farming in the Cauvery delta region for over 12 years. Specialized in heirloom tomatoes and export-grade Cavendish bananas.',
          fpoId: fpoTrichy.id,
        },
      },
    },
    include: { farmerProfile: true },
  });

  const farmer2User = await prisma.user.create({
    data: {
      name: 'Meena Devi',
      email: 'meena@farmdirect.in',
      phone: '+91 94433 22110',
      passwordHash: defaultPassword,
      role: 'FARMER',
      farmerProfile: {
        create: {
          farmName: 'Meenakshi Natural Agri Farm',
          village: 'Melur',
          district: 'Madurai',
          state: 'Tamil Nadu',
          pincode: '625106',
          experience: 8,
          landHolding: 3.0,
          verificationStatus: 'VERIFIED',
          bio: 'Specialist in organic red shallots, Alphonso mangoes, and high-curcumin Erode-variety turmeric.',
          fpoId: fpoMadurai.id,
        },
      },
    },
    include: { farmerProfile: true },
  });

  const farmer3User = await prisma.user.create({
    data: {
      name: 'Arun Kumar',
      email: 'arun@farmdirect.in',
      phone: '+91 97865 43210',
      passwordHash: defaultPassword,
      role: 'FARMER',
      farmerProfile: {
        create: {
          farmName: 'Ponni Granary Estate',
          village: 'Papanasam',
          district: 'Thanjavur',
          state: 'Tamil Nadu',
          pincode: '614205',
          experience: 15,
          landHolding: 8.0,
          verificationStatus: 'VERIFIED',
          bio: 'Traditional paddy and pulse farmer. Directly milling pesticide-free Ponni raw rice and organic green gram.',
          fpoId: fpoTrichy.id,
        },
      },
    },
    include: { farmerProfile: true },
  });

  const farmer4User = await prisma.user.create({
    data: {
      name: 'Lakshmi Narayanan',
      email: 'lakshmi@farmdirect.in',
      phone: '+91 99420 88991',
      passwordHash: defaultPassword,
      role: 'FARMER',
      farmerProfile: {
        create: {
          farmName: 'Kongu Valley Greens',
          village: 'Pollachi',
          district: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode: '642001',
          experience: 6,
          landHolding: 2.5,
          verificationStatus: 'VERIFIED',
          bio: 'Hydroponic and open-field organic vegetable cultivator. Fresh daily harvest of spinach, capsicum and tender coconut.',
          fpoId: fpoTrichy.id,
        },
      },
    },
    include: { farmerProfile: true },
  });

  const farmer5User = await prisma.user.create({
    data: {
      name: 'Suresh Mani',
      email: 'suresh@farmdirect.in',
      phone: '+91 96290 77882',
      passwordHash: defaultPassword,
      role: 'FARMER',
      farmerProfile: {
        create: {
          farmName: 'Yercaud Foot-Hills Mango Orchards',
          village: 'Omalur',
          district: 'Salem',
          state: 'Tamil Nadu',
          pincode: '636455',
          experience: 18,
          landHolding: 6.0,
          verificationStatus: 'VERIFIED',
          bio: 'Award-winning mango grower known for naturally ripened Salem Bengalura, Malgova, and Guntur hot green chillies.',
          fpoId: fpoTrichy.id,
        },
      },
    },
    include: { farmerProfile: true },
  });

  console.log('✅ 5 Verified Farmers created');

  // 5. Create Products & Inventory
  const productsData = [
    {
      farmerId: farmer1User.farmerProfile.id,
      categoryId: catVegetables.id,
      name: 'Farm Fresh Country Tomatoes (நாட்டுக் தக்காளி)',
      description: 'Vine-ripened, naturally grown sour juicy country tomatoes directly harvested from Lalgudi, Trichy. Zero post-harvest chemical treatment.',
      unit: 'kg',
      farmerPrice: 25.0,
      qualityGrade: 'A',
      isOrganic: true,
      quantity: 500,
      harvestDate: new Date(Date.now() - 86400000), // yesterday
    },
    {
      farmerId: farmer1User.farmerProfile.id,
      categoryId: catFruits.id,
      name: 'Grand Naine Bananas (ஜி9 வாழை)',
      description: 'Sweet, spotless, naturally ethylene-ripened Cavendish bananas grown with drip irrigation in the rich Cauvery delta.',
      unit: 'kg',
      farmerPrice: 30.0,
      qualityGrade: 'Premium',
      isOrganic: false,
      quantity: 800,
      harvestDate: new Date(Date.now() - 172800000),
    },
    {
      farmerId: farmer2User.farmerProfile.id,
      categoryId: catVegetables.id,
      name: 'Small Sambhar Onion / Shallots (சின்ன வெங்காயம்)',
      description: 'Pungent, nutrient-rich Madurai country shallots with tight pink skins and high storage life. Perfect for authentic South Indian curries.',
      unit: 'kg',
      farmerPrice: 38.0,
      qualityGrade: 'A',
      isOrganic: true,
      quantity: 400,
      harvestDate: new Date(Date.now() - 259200000),
    },
    {
      farmerId: farmer2User.farmerProfile.id,
      categoryId: catSpices.id,
      name: 'Organic High-Curcumin Turmeric Fingers (விரலி மஞ்சள்)',
      description: 'Steam-boiled and sun-dried raw organic turmeric roots with certified 4.8% curcumin content from Erode/Madurai soil.',
      unit: 'kg',
      farmerPrice: 135.0,
      qualityGrade: 'Premium',
      isOrganic: true,
      quantity: 250,
      harvestDate: new Date(Date.now() - 604800000),
    },
    {
      farmerId: farmer3User.farmerProfile.id,
      categoryId: catGrains.id,
      name: 'Single-Origin Thanjavur Deluxe Ponni Rice (தஞ்சாவூர் பொன்னி)',
      description: 'Aged 1-year traditional Ponni boiled rice directly processed in Thanjavur district. Non-sticky, fragrant, and highly digestible.',
      unit: 'kg',
      farmerPrice: 52.0,
      qualityGrade: 'Premium',
      isOrganic: false,
      quantity: 1200,
      harvestDate: new Date(Date.now() - 1209600000),
    },
    {
      farmerId: farmer3User.farmerProfile.id,
      categoryId: catPulses.id,
      name: 'Native Unpolished Green Gram (பச்சை பயறு)',
      description: 'Freshly harvested, unpolished whole moong beans rich in protein and fiber. Grown as inter-crop after paddy harvest.',
      unit: 'kg',
      farmerPrice: 85.0,
      qualityGrade: 'A',
      isOrganic: true,
      quantity: 350,
      harvestDate: new Date(Date.now() - 432000000),
    },
    {
      farmerId: farmer4User.farmerProfile.id,
      categoryId: catVegetables.id,
      name: 'Ooty Hill Potatoes (ஊட்டி உருளைக்கிழங்கு)',
      description: 'Firm, golden hill potatoes grown in cold red soil. Excellent texture for frying, boiling and curries.',
      unit: 'kg',
      farmerPrice: 28.0,
      qualityGrade: 'A',
      isOrganic: false,
      quantity: 600,
      harvestDate: new Date(Date.now() - 345600000),
    },
    {
      farmerId: farmer5User.farmerProfile.id,
      categoryId: catFruits.id,
      name: 'Naturally Ripened Salem Malgova Mangoes (சேலம் மாம்பழம்)',
      description: 'GI-tagged authentic Salem Malgova mangoes. Tree-ripened with hay, extremely rich pulp with honeyed sweetness and fiberless flesh.',
      unit: 'kg',
      farmerPrice: 110.0,
      qualityGrade: 'Premium',
      isOrganic: true,
      quantity: 450,
      harvestDate: new Date(Date.now() - 86400000),
    },
    {
      farmerId: farmer5User.farmerProfile.id,
      categoryId: catSpices.id,
      name: 'Spicy Guntur Hot Green Chillies (பச்சை மிளகாய்)',
      description: 'Crisp, fiery fresh green chillies harvested in early morning hours. High pungency and glossy deep green color.',
      unit: 'kg',
      farmerPrice: 42.0,
      qualityGrade: 'A',
      isOrganic: false,
      quantity: 300,
      harvestDate: new Date(Date.now() - 86400000),
    },
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const prod = await prisma.product.create({
      data: {
        farmerId: item.farmerId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        unit: item.unit,
        farmerPrice: item.farmerPrice,
        qualityGrade: item.qualityGrade,
        isOrganic: item.isOrganic,
        harvestDate: item.harvestDate,
        images: JSON.stringify([]),
      },
    });

    await prisma.inventory.create({
      data: {
        productId: prod.id,
        availableQty: item.quantity,
      },
    });

    createdProducts.push(prod);
  }

  console.log(`✅ ${createdProducts.length} Realistic Agricultural Products seeded`);

  // 6. Create Demo Completed Order (for rich history & tracking view)
  const orderTomato = createdProducts[0];
  const orderBanana = createdProducts[1];

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'FD-1001',
      buyerId: buyerUser.buyerProfile.id,
      deliveryAddressId: buyerAddress.id,
      status: 'IN_TRANSIT',
      totalFarmerAmount: 2500.0 + 1500.0, // 100kg tomato * 25 + 50kg banana * 30 = 4000
      totalCharges: 900.0 + 450.0, // (1+2+5+1)*100 + (1+2+5+1)*50 = 900 + 450 = 1350
      totalAmount: 5350.0,
      notes: 'Please ensure careful crate packaging for ripe country tomatoes.',
      placedAt: new Date(Date.now() - 172800000),
      items: {
        create: [
          {
            productId: orderTomato.id,
            quantity: 100,
            unit: 'kg',
            farmerPrice: 25.0,
            collectionCharge: 1.0,
            packagingCharge: 2.0,
            transportCharge: 5.0,
            platformFee: 1.0,
            customerPrice: 34.0,
            totalFarmerAmount: 2500.0,
            totalCustomerAmount: 3400.0,
          },
          {
            productId: orderBanana.id,
            quantity: 50,
            unit: 'kg',
            farmerPrice: 30.0,
            collectionCharge: 1.0,
            packagingCharge: 2.0,
            transportCharge: 5.0,
            platformFee: 1.0,
            customerPrice: 39.0,
            totalFarmerAmount: 1500.0,
            totalCustomerAmount: 1950.0,
          },
        ],
      },
      payment: {
        create: {
          amount: 5350.0,
          status: 'PAID',
          provider: 'mock',
          providerPaymentId: 'pay_mock_fd1001',
          paidAt: new Date(Date.now() - 172700000),
        },
      },
      statusHistory: {
        create: [
          {
            status: 'PENDING_FARMER_CONFIRMATION',
            note: 'Order placed by Priya Sundaram',
            updatedBy: 'Priya Sundaram (BUYER)',
            createdAt: new Date(Date.now() - 172800000),
          },
          {
            status: 'FARMER_CONFIRMED',
            note: 'Farmer Ravi Kumar confirmed produce availability',
            updatedBy: 'Ravi Kumar (FARMER)',
            createdAt: new Date(Date.now() - 150000000),
          },
          {
            status: 'FPO_ASSIGNED',
            note: 'Trichy FPO aggregated produce from Lalgudi delta cluster',
            updatedBy: 'K. Balasubramanian (FPO)',
            createdAt: new Date(Date.now() - 120000000),
          },
          {
            status: 'COLLECTED',
            note: 'Collected from farm gate and weighed at Trichy Central Hub',
            updatedBy: 'Murugan Logistics',
            createdAt: new Date(Date.now() - 86400000),
          },
          {
            status: 'PACKED',
            note: 'Graded A-quality produce packed in eco-ventilated crates',
            updatedBy: 'Trichy Collection Center',
            createdAt: new Date(Date.now() - 60000000),
          },
          {
            status: 'IN_TRANSIT',
            note: 'Dispatched via Vehicle TN-45-AZ-2345 to Chennai distribution hub',
            updatedBy: 'Murugan Transport Logistics',
            createdAt: new Date(Date.now() - 20000000),
          },
        ],
      },
    },
    include: { items: true },
  });

  // Farmer Earnings for Order 1
  for (const item of order1.items) {
    await prisma.farmerEarning.create({
      data: {
        farmerId: farmer1User.farmerProfile.id,
        orderItemId: item.id,
        amount: item.totalFarmerAmount,
        status: 'PENDING',
      },
    });
  }

  // Shipment for Order 1
  await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-FD1001',
      orderId: order1.id,
      logisticsId: logisticsUser.logisticsProfile.id,
      vehicleId: vehicle1.id,
      collectionCenterId: centerTrichy.id,
      originAddress: 'Trichy Central Agri Aggregation Hub, SIPCOT, Trichy',
      destinationAddress: 'No. 42, Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017',
      status: 'IN_TRANSIT',
      weight: 150.0,
      pickedUpAt: new Date(Date.now() - 20000000),
      notes: 'Temperature-controlled van transit for ripe fruits and vegetables.',
    },
  });

  // Aggregation for Order 1
  await prisma.aggregation.create({
    data: {
      orderId: order1.id,
      fpoId: fpoTrichy.id,
      collectionCenterId: centerTrichy.id,
      scheduledDate: new Date(Date.now() - 86400000),
      collectedAt: new Date(Date.now() - 86400000),
      status: 'COMPLETED',
      notes: 'Direct Cauvery Delta collection from Farmer Ravi Kumar.',
      items: {
        create: [
          {
            farmerId: farmer1User.farmerProfile.id,
            productName: 'Farm Fresh Country Tomatoes',
            assignedQty: 100,
            unit: 'kg',
            confirmedQty: 100,
          },
          {
            farmerId: farmer1User.farmerProfile.id,
            productName: 'Grand Naine Bananas',
            assignedQty: 50,
            unit: 'kg',
            confirmedQty: 50,
          },
        ],
      },
    },
  });

  // 7. Seed Realistic Multi-Language SMS/Voice Notifications
  await prisma.notification.create({
    data: {
      userId: farmer1User.id,
      orderId: order1.id,
      channel: 'SMS',
      status: 'SENT',
      title: 'New Order Received',
      message: 'New Order Received:\nOrder #FD-1001\nCountry Tomato: 100 kg\nFarmer Price: ₹25/kg\nTotal: ₹2,500\nPlease confirm availability.',
      messageTamil: 'புதிய ஆர்டர் வந்துள்ளது.\nஆர்டர் #FD-1001\nதக்காளி: 100 கிலோ\nவிலை: கிலோ ₹25\nமொத்தம்: ₹2,500\nஆர்டரை உறுதிப்படுத்த 1 அழுத்தவும்.',
      sentAt: new Date(Date.now() - 172700000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: farmer1User.id,
      orderId: order1.id,
      channel: 'VOICE',
      status: 'SENT',
      title: 'Voice Call Triggered (IVR)',
      message: 'Automated Voice IVR: Press 1 to confirm 100 kg Tomato harvest at ₹25/kg.',
      messageTamil: 'தானியங்கி குரல் அழைப்பு: 100 கிலோ தக்காளி ஆர்டரை உறுதிப்படுத்த 1 அழுத்தவும்.',
      sentAt: new Date(Date.now() - 172600000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: buyerUser.id,
      orderId: order1.id,
      channel: 'IN_APP',
      status: 'SENT',
      title: 'Shipment Dispatched!',
      message: 'Your Order #FD-1001 has been dispatched from Trichy Hub and is In Transit to Chennai.',
      sentAt: new Date(Date.now() - 20000000),
    },
  });

  // 8. Reviews
  await prisma.review.create({
    data: {
      productId: orderTomato.id,
      buyerId: buyerUser.buyerProfile.id,
      rating: 5,
      comment: 'Super fresh country tomatoes with authentic sour delta taste! The price breakdown showed the farmer got ₹25/kg directly.',
    },
  });

  console.log('✅ Demo Order #FD-1001, Notifications, and Reviews seeded');
  console.log('\n=============================================');
  console.log('🎉 SEEDING COMPLETE! Login Credentials:');
  console.log('---------------------------------------------');
  // Seed Default Purchase Quota Policy
  await prisma.purchaseQuotaPolicy.create({
    data: {
      name: 'Default Consumer Protection Policy',
      firstOrderLimitKg: 5.0,
      subsequentOrderLimitKg: 1.0,
      customerMonthlyMaxKg: 10.0,
      addressMonthlyMaxKg: 10.0,
      shortIntervalHours: 48,
      riskNormalThreshold: 30.0,
      riskWatchThreshold: 60.0,
      riskRestrictedThreshold: 80.0,
      isActive: true,
    },
  });
  console.log('✅ Default Purchase Quota Policy seeded');

  console.log('✅ Seeding complete!\n=============================================');
  console.log('👨‍🌾 Farmer Demo:    farmer@farmdirect.in    / password123');
  console.log('🛒 Buyer Demo:     buyer@farmdirect.in     / password123');
  console.log('🏢 FPO Demo:       fpo@farmdirect.in       / password123');
  console.log('🚚 Logistics Demo: logistics@farmdirect.in / password123');
  console.log('👑 Admin Demo:     admin@farmdirect.in     / password123');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
