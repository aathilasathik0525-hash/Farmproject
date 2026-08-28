const prisma = require('../config/database');
const {
  createNotification,
  sendNotification,
  notifyOrderStatusChange,
} = require('../services/notification/notificationService');

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      include: {
        order: { select: { orderNumber: true, status: true, totalAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date(), status: 'READ' },
    });

    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/simulate - Manually trigger an SMS/Voice call test notification
const simulateNotification = async (req, res, next) => {
  try {
    const { channel, message, messageTamil, title, language } = req.body;

    const notif = await createNotification({
      userId: req.user.id,
      channel: channel || 'SMS',
      title: title || 'Order Alert Simulation',
      message: message || 'New Order: 100 kg Tomato at ₹25/kg',
      messageTamil: messageTamil || 'புதிய ஆர்டர்: 100 கிலோ தக்காளி - விலை ₹25/கிலோ',
      language: language || 'ta-IN',
    });

    const result = await sendNotification(notif);

    res.status(201).json({
      success: true,
      message: `Notification simulated via channel ${channel}`,
      data: notif,
      providerResponse: result,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/webhook/voice - Incoming IVR DTMF Webhook
const handleVoiceWebhook = async (req, res, next) => {
  try {
    const { Digits, CallSid, From, orderId, orderNumber, action } = req.body;
    const pressedKey = Digits || (action === 'confirm' ? '1' : action === 'reject' ? '2' : null);

    console.log(`[VOICE IVR WEBHOOK] Incoming Key: Digits=${pressedKey}, From=${From}, Order=${orderId || orderNumber}`);

    if (!orderId && !orderNumber) {
      return res.status(400).json({ success: false, message: 'orderId or orderNumber is required' });
    }

    // Find order by ID or Order Number
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ id: orderId }] : []),
          ...(orderNumber ? [{ orderNumber: orderNumber }] : []),
        ],
      },
      include: {
        items: {
          include: {
            product: {
              include: { farmer: { include: { user: true } } },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for IVR reference' });
    }

    let message = 'Voice response recorded';
    let updatedStatus = null;

    if (pressedKey === '1') {
      updatedStatus = 'FARMER_CONFIRMED';

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'FARMER_CONFIRMED' },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'FARMER_CONFIRMED',
            note: 'Farmer confirmed harvest availability via Voice IVR keypad (DTMF 1)',
            updatedBy: `Farmer IVR (${From || 'Phone Keypad'})`,
          },
        });
      });

      message = 'Farmer confirmed harvest availability via Voice IVR';
      notifyOrderStatusChange(order, 'FARMER_CONFIRMED').catch((e) => console.error(e));
    } else if (pressedKey === '2') {
      updatedStatus = 'FARMER_REJECTED';

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'FARMER_REJECTED' },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'FARMER_REJECTED',
            note: 'Farmer indicated harvest unavailability via Voice IVR keypad (DTMF 2)',
            updatedBy: `Farmer IVR (${From || 'Phone Keypad'})`,
          },
        });

        // Restore reserved inventory to available stock
        for (const item of order.items) {
          await tx.inventory.updateMany({
            where: { productId: item.productId },
            data: {
              availableQty: { increment: item.quantity },
              reservedQty: { decrement: item.quantity },
            },
          });
        }
      });

      message = 'Farmer indicated harvest unavailability via Voice IVR';
      notifyOrderStatusChange(order, 'FARMER_REJECTED').catch((e) => console.error(e));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid DTMF digit. Send 1 to confirm or 2 to reject.',
      });
    }

    res.json({
      success: true,
      message,
      orderId: order.id,
      orderNumber: order.orderNumber,
      digitsPressed: pressedKey,
      updatedStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  simulateNotification,
  handleVoiceWebhook,
};
