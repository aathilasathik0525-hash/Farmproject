// Payment Service Abstraction
// Switch between mock (dev) and Razorpay (production) via PAYMENT_PROVIDER env var

const { v4: uuidv4 } = require('uuid');

// ── Provider Interface ────────────────────────────────────────────────────────

class PaymentProvider {
  async createOrder(amount, currency, receipt) { throw new Error('Not implemented'); }
  async verifyPayment(orderId, paymentId, signature) { throw new Error('Not implemented'); }
}

// ── Mock Provider (Development) ───────────────────────────────────────────────

class MockPaymentProvider extends PaymentProvider {
  async createOrder(amount, currency = 'INR', receipt) {
    console.log(`[MOCK PAYMENT] Creating order: ₹${amount} | Receipt: ${receipt}`);
    return {
      id: `mock_order_${uuidv4()}`,
      amount: amount * 100, // paise
      currency,
      receipt,
      status: 'created',
      provider: 'mock',
    };
  }

  async verifyPayment(orderId, paymentId, signature) {
    // In dev mode, always verify as successful
    console.log(`[MOCK PAYMENT] Verifying: ${paymentId}`);
    return { verified: true, provider: 'mock' };
  }
}

// ── Razorpay Provider (Production) ───────────────────────────────────────────

class RazorpayProvider extends PaymentProvider {
  constructor() {
    super();
    const Razorpay = require('razorpay'); // loaded only when needed
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(amount, currency = 'INR', receipt) {
    const order = await this.razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
    });
    return { ...order, provider: 'razorpay' };
  }

  async verifyPayment(orderId, paymentId, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return {
      verified: expectedSignature === signature,
      provider: 'razorpay',
    };
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

function getPaymentProvider() {
  const provider = process.env.PAYMENT_PROVIDER || 'mock';
  switch (provider) {
    case 'razorpay': return new RazorpayProvider();
    default: return new MockPaymentProvider();
  }
}

const paymentProvider = getPaymentProvider();

module.exports = {
  createPaymentOrder: (amount, currency, receipt) =>
    paymentProvider.createOrder(amount, currency, receipt),
  verifyPayment: (orderId, paymentId, signature) =>
    paymentProvider.verifyPayment(orderId, paymentId, signature),
  getProviderName: () => process.env.PAYMENT_PROVIDER || 'mock',
};
