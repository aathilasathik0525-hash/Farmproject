const prisma = require('../config/database');

// GET /api/admin/analytics
const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalFarmers = await prisma.farmerProfile.count();
    const totalBuyers = await prisma.buyerProfile.count();
    const totalFPOs = await prisma.fPO.count();
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalOrders = await prisma.order.count();
    const activeOrders = await prisma.order.count({
      where: {
        status: {
          notIn: ['DELIVERED', 'CANCELLED', 'FARMER_REJECTED'],
        },
      },
    });
    const completedOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });

    // Financials
    const ordersWithAmounts = await prisma.order.findMany({
      select: { totalAmount: true, totalFarmerAmount: true, totalCharges: true, status: true },
    });

    const totalGrossRevenue = ordersWithAmounts.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalFarmerEarnings = ordersWithAmounts.reduce((sum, o) => sum + o.totalFarmerAmount, 0);
    const totalPlatformCharges = ordersWithAmounts.reduce((sum, o) => sum + o.totalCharges, 0);

    // Active shipments
    const activeShipments = await prisma.shipment.count({
      where: { status: { notIn: ['DELIVERED'] } },
    });

    // Recent activity log from orderStatusHistory
    const recentActivities = await prisma.orderStatusHistory.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { orderNumber: true, totalAmount: true } },
      },
    });

    // Category breakdown
    const categories = await prisma.productCategory.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });

    const categoryDistribution = categories.map((c) => ({
      name: c.name,
      value: c._count.products,
    }));

    // Status breakdown
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Mock Impact Metrics (combines real DB stats with realistic regional platform reach)
    const impactStats = {
      farmersConnected: Math.max(1250, totalFarmers * 250),
      farmerEarningsLakh: (Math.max(18.4, totalFarmerEarnings / 100000)).toFixed(1),
      ordersDelivered: Math.max(3800, totalOrders * 120),
      intermediaryCostReductionPercent: 27.5,
      fposConnected: Math.max(15, totalFPOs),
      collectionCentersActive: 8,
    };

    // Orders trend (last 6 months simulation with real base)
    const monthlyTrends = [
      { month: 'Oct', orders: 240, farmerPayout: 180000, buyerSpend: 245000 },
      { month: 'Nov', orders: 380, farmerPayout: 290000, buyerSpend: 395000 },
      { month: 'Dec', orders: 510, farmerPayout: 410000, buyerSpend: 558000 },
      { month: 'Jan', orders: 690, farmerPayout: 560000, buyerSpend: 760000 },
      { month: 'Feb', orders: 840, farmerPayout: 710000, buyerSpend: 965000 },
      { month: 'Mar', orders: Math.max(920, totalOrders * 10), farmerPayout: Math.max(840000, totalFarmerEarnings), buyerSpend: Math.max(1140000, totalGrossRevenue) },
    ];

    res.json({
      success: true,
      data: {
        metrics: {
          totalFarmers,
          totalBuyers,
          totalFPOs,
          totalProducts,
          totalOrders,
          activeOrders,
          completedOrders,
          totalGrossRevenue,
          totalFarmerEarnings,
          totalPlatformCharges,
          activeShipments,
        },
        impactStats,
        categoryDistribution,
        statusDistribution: statusCounts,
        monthlyTrends,
        recentActivities,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        isActive: true,
        farmerProfile: { select: { village: true, district: true, verificationStatus: true } },
        fpoProfile: { select: { designation: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminAnalytics,
  getUsers,
};
