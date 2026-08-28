const prisma = require('../config/database');

// GET /api/shipments
const getShipments = async (req, res, next) => {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        order: {
          include: {
            items: { include: { product: true } },
            buyer: { include: { user: true } },
            deliveryAddress: true,
          },
        },
        vehicle: true,
        collectionCenter: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (err) {
    next(err);
  }
};

// GET /api/logistics/vehicles
const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        logistics: { include: { user: { select: { name: true } } } },
        _count: { select: { shipments: true } },
      },
    });
    res.json({ success: true, data: vehicles });
  } catch (err) {
    next(err);
  }
};

// POST /api/shipments
const createShipment = async (req, res, next) => {
  try {
    const {
      orderId,
      vehicleId,
      collectionCenterId,
      originAddress,
      destinationAddress,
      weight,
      notes,
    } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { deliveryAddress: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const count = await prisma.shipment.count();
    const shipmentNumber = `SHP-${1000 + count + 1}`;

    const shipment = await prisma.shipment.create({
      data: {
        shipmentNumber,
        orderId,
        vehicleId,
        collectionCenterId,
        originAddress: originAddress || 'Trichy Agri Collection Center',
        destinationAddress: destinationAddress || (order.deliveryAddress ? `${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city}` : 'Chennai, Tamil Nadu'),
        weight: weight ? parseFloat(weight) : 100,
        notes,
        status: 'PICKUP_ASSIGNED',
      },
      include: {
        order: true,
        vehicle: true,
        collectionCenter: true,
      },
    });

    res.status(201).json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/shipments/:id/status
const updateShipmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const shipmentId = req.params.id;

    const updateData = { status, notes: notes || undefined };
    if (status === 'PICKED_UP') updateData.pickedUpAt = new Date();
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();

    const shipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: updateData,
      include: { order: true },
    });

    // Map shipment status to order status
    const shipmentToOrderStatus = {
      PICKUP_ASSIGNED: 'COLLECTION_SCHEDULED',
      PICKED_UP: 'COLLECTED',
      AT_COLLECTION_CENTER: 'COLLECTED',
      PACKED: 'PACKED',
      IN_TRANSIT: 'IN_TRANSIT',
      OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
      DELIVERED: 'DELIVERED',
    };

    const targetOrderStatus = shipmentToOrderStatus[status];
    if (targetOrderStatus && shipment.orderId) {
      await prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: targetOrderStatus },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: shipment.orderId,
          status: targetOrderStatus,
          note: `Logistics update: Shipment is now ${status.replace(/_/g, ' ')}`,
          updatedBy: req.user.name,
        },
      });

      // If delivered, mark farmer earnings paid
      if (status === 'DELIVERED') {
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: shipment.orderId },
        });
        const ids = orderItems.map((i) => i.id);
        await prisma.farmerEarning.updateMany({
          where: { orderItemId: { in: ids } },
          data: { status: 'PAID', paidAt: new Date() },
        });
      }
    }

    res.json({
      success: true,
      message: `Shipment status updated to ${status}`,
      data: shipment,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShipments,
  getVehicles,
  createShipment,
  updateShipmentStatus,
};
