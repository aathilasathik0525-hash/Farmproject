const prisma = require('../config/database');
const {
  createPaymentOrder,
  verifyPayment,
  getProviderName,
} = require('../services/payment/paymentService');

// POST /api/payments/create-order
const createPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const paymentOrder = await createPaymentOrder(
      order.totalAmount,
      'INR',
      `receipt_${order.orderNumber}`
    );

    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        amount: order.totalAmount,
        provider: getProviderName(),
        providerOrderId: paymentOrder.id,
        status: 'PENDING',
      },
      update: {
        providerOrderId: paymentOrder.id,
      },
    });

    res.json({
      success: true,
      data: paymentOrder,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/verify
const verify = async (req, res, next) => {
  try {
    const { orderId, providerOrderId, providerPaymentId, providerSignature } = req.body;

    const result = await verifyPayment(providerOrderId, providerPaymentId, providerSignature);

    if (!result.verified) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    await prisma.payment.update({
      where: { orderId },
      data: {
        status: 'PAID',
        providerPaymentId,
        providerSignature,
        paidAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Payment verified and captured successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, verify };
