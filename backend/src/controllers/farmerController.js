const prisma = require('../config/database');
const { calculatePriceBreakdown } = require('./productController');

// GET /api/farmers - Public marketplace list of verified & active registered farmers
const getPublicFarmers = async (req, res, next) => {
  try {
    const { search, district, state } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { farmName: { contains: search } },
        { village: { contains: search } },
        { district: { contains: search } },
        { user: { name: { contains: search } } },
      ];
    }

    if (district) {
      where.district = { contains: district };
    }

    if (state) {
      where.state = { contains: state };
    }

    const farmers = await prisma.farmerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            preferredLanguage: true,
            createdAt: true,
          },
        },
        fpo: {
          select: {
            id: true,
            name: true,
            district: true,
          },
        },
        products: {
          where: {
            isActive: true,
            inventory: {
              availableQty: { gt: 0 },
            },
          },
          include: {
            inventory: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedFarmers = farmers.map((f) => {
      const activeProductsCount = f.products.length;
      const totalAvailableStock = f.products.reduce(
        (sum, p) => sum + (p.inventory?.availableQty || 0),
        0
      );
      const categories = [...new Set(f.products.map((p) => p.category?.name).filter(Boolean))];

      return {
        id: f.id,
        userId: f.userId,
        name: f.user?.name || 'Farmer',
        farmName: f.farmName,
        village: f.village,
        district: f.district,
        state: f.state,
        pincode: f.pincode,
        experience: f.experience,
        landHolding: f.landHolding,
        verificationStatus: f.verificationStatus,
        bio: f.bio,
        profileImage: f.profileImage,
        preferredLanguage: f.preferredLanguage || f.user?.preferredLanguage || 'ta-IN',
        fpo: f.fpo,
        activeProductsCount,
        totalAvailableStock,
        categories,
      };
    });

    res.json({
      success: true,
      count: enrichedFarmers.length,
      data: enrichedFarmers,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/farmers/:id - Public details & ONLY active products of this specific farmer
const getFarmerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            preferredLanguage: true,
          },
        },
        fpo: {
          select: {
            id: true,
            name: true,
            district: true,
            contactPhone: true,
          },
        },
      },
    });

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    // Query ONLY active in-stock products belonging to this specific farmer
    const products = await prisma.product.findMany({
      where: {
        farmerId: id,
        isActive: true,
      },
      include: {
        category: true,
        inventory: true,
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            buyer: { select: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format products with transparent price breakdown and available stock
    const enrichedProducts = products.map((prod) => {
      const breakdown = calculatePriceBreakdown(prod.farmerPrice);
      const avgRating = prod.reviews.length
        ? prod.reviews.reduce((acc, r) => acc + r.rating, 0) / prod.reviews.length
        : 4.8;

      let parsedImages = [];
      try {
        parsedImages = JSON.parse(prod.images || '[]');
      } catch (e) {
        parsedImages = [];
      }

      return {
        ...prod,
        images: parsedImages,
        priceBreakdown: breakdown,
        averageRating: Number(avgRating.toFixed(1)),
        reviewCount: prod.reviews.length,
        availableStock: prod.inventory?.availableQty || 0,
        farmer: {
          id: farmer.id,
          village: farmer.village,
          district: farmer.district,
          state: farmer.state,
          user: {
            name: farmer.user?.name,
            phone: farmer.user?.phone,
          },
        },
      };
    });

    res.json({
      success: true,
      data: {
        farmer: {
          id: farmer.id,
          userId: farmer.userId,
          name: farmer.user?.name,
          farmName: farmer.farmName,
          village: farmer.village,
          district: farmer.district,
          state: farmer.state,
          pincode: farmer.pincode,
          experience: farmer.experience,
          landHolding: farmer.landHolding,
          verificationStatus: farmer.verificationStatus,
          bio: farmer.bio,
          profileImage: farmer.profileImage,
          preferredLanguage: farmer.preferredLanguage || farmer.user?.preferredLanguage || 'ta-IN',
          fpo: farmer.fpo,
        },
        products: enrichedProducts,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/farmers/dashboard - Authenticated farmer dashboard statistics
const getFarmerDashboard = async (req, res, next) => {
  try {
    const farmerId = req.user.farmerProfile?.id;

    if (!farmerId) {
      return res.status(403).json({ success: false, message: 'Farmer profile required' });
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: {
        user: { select: { name: true, phone: true, email: true, preferredLanguage: true } },
        fpo: true,
      },
    });

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found' });
    }

    // Products listed
    const products = await prisma.product.findMany({
      where: { farmerId, isActive: true },
      include: { inventory: true, category: true },
      orderBy: { createdAt: 'desc' },
    });

    // Total available stock across all products
    const totalStock = products.reduce((acc, p) => acc + (p.inventory?.availableQty || 0), 0);

    // Earnings
    const earnings = await prisma.farmerEarning.findMany({
      where: { farmerId },
      include: {
        orderItem: {
          include: { product: true, order: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalEarnings = earnings.reduce((acc, e) => acc + e.amount, 0);
    const paidEarnings = earnings.filter((e) => e.status === 'PAID').reduce((acc, e) => acc + e.amount, 0);
    const pendingEarnings = totalEarnings - paidEarnings;

    // Recent orders involving this farmer's products
    const recentOrders = await prisma.order.findMany({
      where: {
        items: {
          some: { product: { farmerId } },
        },
      },
      include: {
        items: {
          where: { product: { farmerId } },
          include: { product: true },
        },
        buyer: { include: { user: { select: { name: true, phone: true } } } },
        deliveryAddress: true,
      },
      orderBy: { placedAt: 'desc' },
      take: 15,
    });

    const pendingOrdersCount = recentOrders.filter(
      (o) => o.status === 'PENDING_FARMER_CONFIRMATION' || o.status === 'FARMER_CONFIRMED'
    ).length;

    const completedOrdersCount = recentOrders.filter((o) => o.status === 'DELIVERED').length;

    // Notifications for this farmer's user account
    const notifications = await prisma.notification.findMany({
      where: { userId: farmer.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      data: {
        farmer,
        stats: {
          totalProducts: products.length,
          totalStock,
          pendingOrders: pendingOrdersCount,
          completedOrders: completedOrdersCount,
          totalEarnings,
          paidEarnings,
          pendingEarnings,
        },
        products,
        earnings,
        recentOrders,
        notifications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/farmers/earnings - Authenticated farmer earnings
const getFarmerEarnings = async (req, res, next) => {
  try {
    const farmerId = req.user.farmerProfile?.id;

    if (!farmerId) {
      return res.status(403).json({ success: false, message: 'Farmer profile required' });
    }

    const earnings = await prisma.farmerEarning.findMany({
      where: { farmerId },
      include: {
        orderItem: {
          include: {
            product: { select: { name: true, unit: true, farmerPrice: true } },
            order: { select: { orderNumber: true, placedAt: true, status: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSold = earnings.reduce((acc, e) => acc + (e.orderItem?.quantity || 0), 0);
    const totalAmount = earnings.reduce((acc, e) => acc + e.amount, 0);

    res.json({
      success: true,
      data: {
        totalSold,
        totalAmount,
        earnings,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicFarmers,
  getFarmerById,
  getFarmerDashboard,
  getFarmerEarnings,
};
