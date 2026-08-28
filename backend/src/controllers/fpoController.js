const prisma = require('../config/database');

// GET /api/fpos - List all FPOs
const getFPOs = async (req, res, next) => {
  try {
    const fpos = await prisma.fPO.findMany({
      include: {
        _count: { select: { farmers: true, collectionCenters: true, aggregations: true } },
        collectionCenters: true,
      },
    });
    res.json({ success: true, data: fpos });
  } catch (err) {
    next(err);
  }
};

// GET /api/fpos/:id/farmers - Farmers associated with FPO
const getFPOFarmers = async (req, res, next) => {
  try {
    const fpoId = req.params.id;
    const farmers = await prisma.farmerProfile.findMany({
      where: { fpoId },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        products: {
          include: { inventory: true, category: true },
        },
      },
    });
    res.json({ success: true, count: farmers.length, data: farmers });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/fpos/farmers/:farmerId/verify - Verify a farmer
const verifyFarmer = async (req, res, next) => {
  try {
    const { farmerId } = req.params;
    const { status = 'VERIFIED' } = req.body;

    const updated = await prisma.farmerProfile.update({
      where: { id: farmerId },
      data: {
        verificationStatus: status,
        verifiedBy: req.user.name,
        verifiedAt: new Date(),
      },
      include: { user: { select: { name: true, phone: true } } },
    });

    res.json({
      success: true,
      message: `Farmer ${updated.user.name} verification set to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/fpos/aggregation - Create multi-farmer aggregation for an order
const createAggregation = async (req, res, next) => {
  try {
    const { orderId, fpoId, collectionCenterId, scheduledDate, items, notes } = req.body;

    const aggregation = await prisma.$transaction(async (tx) => {
      // Create aggregation record
      const agg = await tx.aggregation.create({
        data: {
          orderId,
          fpoId,
          collectionCenterId,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 86400000),
          notes,
          status: 'PENDING',
          items: {
            create: items.map((item) => ({
              farmerId: item.farmerId,
              productName: item.productName,
              assignedQty: parseFloat(item.assignedQty),
              unit: item.unit || 'kg',
            })),
          },
        },
        include: {
          items: {
            include: {
              farmer: { include: { user: { select: { name: true, phone: true } } } },
            },
          },
          collectionCenter: true,
          fpo: true,
        },
      });

      // Advance order state to FPO_ASSIGNED
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'FPO_ASSIGNED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'FPO_ASSIGNED',
          note: `Aggregated produce assigned across ${items.length} farmers by FPO.`,
          updatedBy: req.user.name,
        },
      });

      return agg;
    });

    res.status(201).json({
      success: true,
      message: 'Produce aggregation created and assigned to farmers',
      data: aggregation,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/fpos/collection-centers
const getCollectionCenters = async (req, res, next) => {
  try {
    const centers = await prisma.collectionCenter.findMany({
      include: {
        fpo: { select: { name: true, district: true } },
        _count: { select: { aggregations: true, shipments: true } },
      },
    });
    res.json({ success: true, data: centers });
  } catch (err) {
    next(err);
  }
};

// POST /api/fpos/collection-centers
const createCollectionCenter = async (req, res, next) => {
  try {
    const { fpoId, name, address, district, state = 'Tamil Nadu', capacity, gpsLat, gpsLng } = req.body;

    const center = await prisma.collectionCenter.create({
      data: {
        fpoId,
        name,
        address,
        district,
        state,
        capacity: capacity ? parseFloat(capacity) : 50,
        gpsLat: gpsLat ? parseFloat(gpsLat) : null,
        gpsLng: gpsLng ? parseFloat(gpsLng) : null,
      },
    });

    res.status(201).json({ success: true, data: center });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFPOs,
  getFPOFarmers,
  verifyFarmer,
  createAggregation,
  getCollectionCenters,
  createCollectionCenter,
};
