const prisma = require('../config/database');
const { calculatePriceBreakdown } = require('./productController');
const {
  notifyNewOrder,
  notifyOrderStatusChange,
} = require('../services/notification/notificationService');
const {
  validateOrderPurchaseRestrictions,
  recordOrderPurchaseHistory,
  restoreOrderQuota,
} = require('../services/restriction/purchaseRestrictionService');

// Valid state machine transitions
const VALID_TRANSITIONS = {
  PENDING_FARMER_CONFIRMATION: ['FARMER_CONFIRMED', 'FARMER_REJECTED', 'CANCELLED'],
  FARMER_CONFIRMED: ['FPO_ASSIGNED', 'COLLECTION_SCHEDULED', 'CANCELLED'],
  FARMER_REJECTED: [],
  FPO_ASSIGNED: ['COLLECTION_SCHEDULED', 'CANCELLED'],
  COLLECTION_SCHEDULED: ['COLLECTED', 'CANCELLED'],
  COLLECTED: ['PACKED', 'CANCELLED'],
  PACKED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// Generate unique Order Number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `FD-${timestamp}-${random}`;
};

// POST /api/orders/validate-checkout
const validateCheckout = async (req, res, next) => {
  try {
    const buyerId = req.user.buyerProfile?.id;
    if (!buyerId) {
      return res.status(403).json({
        success: false,
        message: 'Authenticated customer/buyer profile required to validate checkout limits',
      });
    }

    const { items, deliveryAddress, deliveryAddressId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items required for validation' });
    }

    let targetAddress = deliveryAddress;
    if (!targetAddress && deliveryAddressId) {
      targetAddress = await prisma.deliveryAddress.findUnique({
        where: { id: deliveryAddressId },
      });
    }

    if (!targetAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }

    const validationResult = await validateOrderPurchaseRestrictions({
      buyerId,
      deliveryAddress: targetAddress,
      items,
    });

    res.json({
      success: true,
      ...validationResult,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders (Authenticated Buyer only)
const createOrder = async (req, res, next) => {
  try {
    const buyerId = req.user.buyerProfile?.id;
    if (!buyerId) {
      return res.status(403).json({
        success: false,
        message: 'Authenticated customer/buyer profile required to place orders',
      });
    }

    const { items, deliveryAddress, deliveryAddressId, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    // Process all items in database transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Resolve Delivery Address
      let finalAddressId = deliveryAddressId;
      let addressForValidation = deliveryAddress;

      if (finalAddressId && !addressForValidation) {
        addressForValidation = await tx.deliveryAddress.findUnique({
          where: { id: finalAddressId },
        });
      }

      if (!finalAddressId && deliveryAddress) {
        const newAddress = await tx.deliveryAddress.create({
          data: {
            buyerId,
            label: deliveryAddress.label || 'Home',
            addressLine1: deliveryAddress.addressLine1,
            addressLine2: deliveryAddress.addressLine2,
            city: deliveryAddress.city,
            district: deliveryAddress.district,
            state: deliveryAddress.state || 'Tamil Nadu',
            pincode: deliveryAddress.pincode,
            gpsLat: deliveryAddress.gpsLat,
            gpsLng: deliveryAddress.gpsLng,
          },
        });
        finalAddressId = newAddress.id;
        addressForValidation = newAddress;
      }

      if (!addressForValidation) {
        const err = new Error('Valid destination delivery address is required.');
        err.status = 400;
        throw err;
      }

      // 2. CRITICAL BACKEND PURCHASE RESTRICTION VALIDATION
      const restrictionCheck = await validateOrderPurchaseRestrictions({
        buyerId,
        deliveryAddress: addressForValidation,
        items,
      });

      if (!restrictionCheck.allowed) {
        const restrictedItem = restrictionCheck.itemsEvaluation.find(
          (i) => i.status === 'RESTRICTED' || i.status === 'PARTIAL_ALLOW'
        );
        const err = new Error(
          restrictedItem?.message ||
            restrictionCheck.bannerMessage ||
            'Order exceeds maximum permissible monthly limit for this delivery address.'
        );
        err.status = 400;
        throw err;
      }

      let targetFarmerId = null;
      let totalFarmerAmount = 0;
      let totalCharges = 0;
      let totalAmount = 0;

      const orderItemsToCreate = [];

      // 2. Validate products, enforce SINGLE FARMER PER ORDER & check inventory
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true, farmer: { include: { user: true } } },
        });

        if (!product || !product.isActive) {
          const err = new Error(`Product ${item.productId} is not available in the marketplace`);
          err.status = 400;
          throw err;
        }

        // Enforce single farmer per order
        if (!targetFarmerId) {
          targetFarmerId = product.farmerId;
        } else if (targetFarmerId !== product.farmerId) {
          const err = new Error(
            'Your order contains products from multiple farmers. Please order from one farmer at a time.'
          );
          err.status = 400;
          throw err;
        }

        const requestedQty = parseFloat(item.quantity);
        if (isNaN(requestedQty) || requestedQty <= 0) {
          const err = new Error(`Invalid quantity specified for ${product.name}`);
          err.status = 400;
          throw err;
        }

        if (!product.inventory || product.inventory.availableQty < requestedQty) {
          const avail = product.inventory?.availableQty || 0;
          const err = new Error(
            `Only ${avail} ${product.unit} of ${product.name} is currently available in stock.`
          );
          err.status = 400;
          throw err;
        }

        const breakdown = calculatePriceBreakdown(product.farmerPrice);
        const itemFarmerTotal = breakdown.farmerPrice * requestedQty;
        const itemChargesTotal = breakdown.totalCharges * requestedQty;
        const itemCustomerTotal = breakdown.customerPrice * requestedQty;

        totalFarmerAmount += itemFarmerTotal;
        totalCharges += itemChargesTotal;
        totalAmount += itemCustomerTotal;

        // Reduce available inventory transactionally
        await tx.inventory.update({
          where: { productId: product.id },
          data: {
            availableQty: { decrement: requestedQty },
            reservedQty: { increment: requestedQty },
          },
        });

        orderItemsToCreate.push({
          productId: product.id,
          quantity: requestedQty,
          unit: product.unit,
          farmerPrice: breakdown.farmerPrice,
          collectionCharge: breakdown.collectionCharge,
          packagingCharge: breakdown.packagingCharge,
          transportCharge: breakdown.transportCharge,
          platformFee: breakdown.platformFee,
          customerPrice: breakdown.customerPrice,
          totalFarmerAmount: itemFarmerTotal,
          totalCustomerAmount: itemCustomerTotal,
        });
      }

      const orderNumber = generateOrderNumber();

      // 3. Create Order in Database
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId,
          deliveryAddressId: finalAddressId,
          status: 'PENDING_FARMER_CONFIRMATION',
          totalFarmerAmount,
          totalCharges,
          totalAmount,
          notes,
          items: {
            create: orderItemsToCreate,
          },
          statusHistory: {
            create: {
              status: 'PENDING_FARMER_CONFIRMATION',
              note: 'Order placed by customer. Awaiting farmer harvest confirmation.',
              updatedBy: `${req.user.name} (CUSTOMER)`,
            },
          },
          payment: {
            create: {
              amount: totalAmount,
              status: 'PAID',
              provider: 'mock',
              paidAt: new Date(),
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  farmer: {
                    include: { user: true },
                  },
                },
              },
            },
          },
          buyer: { include: { user: true } },
          deliveryAddress: true,
          payment: true,
        },
      });

      // 4. Create farmer earnings records linked to the specific farmer
      for (const createdItem of newOrder.items) {
        await tx.farmerEarning.create({
          data: {
            farmerId: createdItem.product.farmerId,
            orderItemId: createdItem.id,
            amount: createdItem.totalFarmerAmount,
            status: 'PENDING',
          },
        });
      }

      // 5. Record address purchase history & evaluate risk score
      await recordOrderPurchaseHistory(newOrder, tx);

      return newOrder;
    });

    // 5. Trigger notifications asynchronously to ONLY the owning farmer
    notifyNewOrder(order).catch((err) =>
      console.error('[ORDER NOTIFICATION ERROR]:', err.message || err)
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Automated notification dispatched to the farmer.',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const { role } = req.user;
    let where = {};

    if (role === 'BUYER') {
      where.buyerId = req.user.buyerProfile?.id;
    } else if (role === 'FARMER') {
      const farmerId = req.user.farmerProfile?.id;
      where.items = {
        some: {
          product: { farmerId },
        },
      };
    } else if (role === 'FPO') {
      const fpoId = req.user.fpoProfile?.fpoId;
      where.OR = [
        { aggregation: { fpoId } },
        { items: { some: { product: { farmer: { fpoId } } } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: {
                  include: { user: { select: { name: true, phone: true, preferredLanguage: true } } },
                },
              },
            },
          },
        },
        buyer: {
          include: { user: { select: { name: true, phone: true, email: true } } },
        },
        deliveryAddress: true,
        payment: true,
        shipment: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { placedAt: 'desc' },
    });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                farmer: {
                  include: { user: { select: { name: true, phone: true, email: true } } },
                },
              },
            },
            farmerEarning: true,
          },
        },
        buyer: {
          include: { user: { select: { name: true, phone: true, email: true } } },
        },
        deliveryAddress: true,
        payment: true,
        shipment: {
          include: { vehicle: true, collectionCenter: true },
        },
        aggregation: {
          include: {
            items: { include: { farmer: { include: { user: true } } } },
            fpo: true,
            collectionCenter: true,
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role ownership check
    if (req.user.role === 'BUYER' && order.buyerId !== req.user.buyerProfile?.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this order' });
    }

    if (req.user.role === 'FARMER') {
      const farmerId = req.user.farmerProfile?.id;
      const ownsItem = order.items.some((i) => i.product.farmerId === farmerId);
      if (!ownsItem) {
        return res.status(403).json({ success: false, message: 'Access denied: You do not own products in this order' });
      }
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const orderId = req.params.id;

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        deliveryAddress: true,
      },
    });

    if (!currentOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validate state transition
    const allowed = VALID_TRANSITIONS[currentOrder.status] || [];
    if (!allowed.includes(status) && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentOrder.status} to ${status}. Allowed: ${allowed.join(', ')}`,
      });
    }

    // Role-based authorization for farmer actions
    if (status === 'FARMER_CONFIRMED' || status === 'FARMER_REJECTED') {
      if (req.user.role === 'FARMER') {
        const farmerId = req.user.farmerProfile?.id;
        const ownsItem = currentOrder.items.some((i) => i.product.farmerId === farmerId);
        if (!ownsItem) {
          return res.status(403).json({
            success: false,
            message: 'Unauthorized: Only the owning farmer can confirm or reject this order',
          });
        }
      } else if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only the designated farmer or Admin can update harvest confirmation status',
        });
      }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const ord = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      // Add status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          note: note || `Status updated to ${status}`,
          updatedBy: `${req.user.name} (${req.user.role})`,
        },
      });

      // If DELIVERED, mark shipment delivered and farmer earnings as PAID
      if (status === 'DELIVERED') {
        await tx.shipment.updateMany({
          where: { orderId },
          data: { status: 'DELIVERED', deliveredAt: new Date() },
        });

        const itemIds = currentOrder.items.map((i) => i.id);
        await tx.farmerEarning.updateMany({
          where: { orderItemId: { in: itemIds } },
          data: { status: 'PAID', paidAt: new Date() },
        });
      }

      // If CANCELLED or FARMER_REJECTED, restore inventory and quota
      if (status === 'CANCELLED' || status === 'FARMER_REJECTED') {
        for (const item of currentOrder.items) {
          await tx.inventory.updateMany({
            where: { productId: item.productId },
            data: {
              availableQty: { increment: item.quantity },
              reservedQty: { decrement: item.quantity },
            },
          });
        }
        await restoreOrderQuota(orderId, tx);
      }

      return ord;
    });

    // Trigger buyer & farmer status notifications asynchronously
    notifyOrderStatusChange(updatedOrder, status).catch((e) => console.error(e));

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  validateCheckout,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
