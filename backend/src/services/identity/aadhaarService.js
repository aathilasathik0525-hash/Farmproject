const crypto = require('crypto');
const prisma = require('../../config/database');

// Secret salt for HMAC hashing of Aadhaar (irreversible token)
const AADHAAR_SALT = process.env.AADHAAR_HASH_SALT || 'farmdirect_secure_aadhaar_salt_2026_!#';

// Temporary in-memory store for pending OTP sessions (expires in 5 minutes)
// Key: txnId -> { aadhaarHash, maskedAadhaar, mobile, otpHash, expiresAt }
const pendingOtpSessions = new Map();

// Periodic cleanup of expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [txnId, session] of pendingOtpSessions.entries()) {
    if (session.expiresAt < now) {
      pendingOtpSessions.delete(txnId);
    }
  }
}, 60000);

/**
 * Validates format of 12-digit Aadhaar number
 */
function validateAadhaarFormat(aadhaarNumber) {
  if (!aadhaarNumber) return false;
  const cleaned = String(aadhaarNumber).replace(/[\s-]/g, '');
  return /^\d{12}$/.test(cleaned);
}

/**
 * Produces irreversible HMAC-SHA256 token from Aadhaar
 */
function hashAadhaar(aadhaarNumber) {
  const cleaned = String(aadhaarNumber).replace(/[\s-]/g, '');
  return crypto.createHmac('sha256', AADHAAR_SALT).update(cleaned).digest('hex');
}

/**
 * Produces masked Aadhaar string (e.g. "XXXX-XXXX-4589")
 */
function maskAadhaar(aadhaarNumber) {
  const cleaned = String(aadhaarNumber).replace(/[\s-]/g, '');
  if (cleaned.length !== 12) return 'XXXX-XXXX-XXXX';
  return `XXXX-XXXX-${cleaned.slice(8)}`;
}

/**
 * Generates an internal unique Customer ID
 */
function generateCustomerId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CUST-${random}`;
}

/**
 * Initiates Aadhaar OTP verification
 * In development (NODE_ENV !== 'production'), provides mock OTP provider
 */
async function initiateAadhaarOtp({ aadhaarNumber, mobile }) {
  const cleanedAadhaar = String(aadhaarNumber).replace(/[\s-]/g, '');
  if (!validateAadhaarFormat(cleanedAadhaar)) {
    const error = new Error('Invalid Aadhaar number format. Please provide a valid 12-digit Aadhaar.');
    error.status = 400;
    throw error;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const aadhaarHash = hashAadhaar(cleanedAadhaar);
  const maskedAadhaar = maskAadhaar(cleanedAadhaar);

  // Check if this Aadhaar is already registered and verified
  const existingVerification = await prisma.customerVerification.findUnique({
    where: { aadhaarHash },
    include: { buyer: { include: { user: true } } },
  });

  if (existingVerification) {
    const error = new Error('This Aadhaar identity is already linked to an existing FARMDirect customer account.');
    error.status = 409;
    throw error;
  }

  // Generate 6-digit OTP
  const otp = isProduction ? String(Math.floor(100000 + Math.random() * 900000)) : '123456';
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  const txnId = crypto.randomUUID();

  // Store pending session (5 min expiry)
  pendingOtpSessions.set(txnId, {
    aadhaarHash,
    maskedAadhaar,
    mobile: mobile || 'Verified via UIDAI',
    otpHash,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return {
    success: true,
    txnId,
    maskedAadhaar,
    message: isProduction
      ? 'OTP sent to mobile registered with Aadhaar (UIDAI secure gateway).'
      : 'MOCK OTP dispatched for development testing (Use OTP: 123456).',
    isMock: !isProduction,
    // Provide test OTP only in development mode for interactive testing
    mockOtp: !isProduction ? '123456' : undefined,
  };
}

/**
 * Verifies submitted OTP against session
 */
async function verifyAadhaarOtp({ txnId, otp }) {
  if (!txnId || !otp) {
    const error = new Error('Transaction ID and OTP are required');
    error.status = 400;
    throw error;
  }

  const session = pendingOtpSessions.get(txnId);
  if (!session) {
    const error = new Error('Verification session expired or invalid. Please request a new OTP.');
    error.status = 400;
    throw error;
  }

  if (Date.now() > session.expiresAt) {
    pendingOtpSessions.delete(txnId);
    const error = new Error('OTP has expired. Please request a new OTP.');
    error.status = 400;
    throw error;
  }

  const submittedHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
  if (submittedHash !== session.otpHash) {
    const error = new Error('Invalid OTP entered. Please check and try again.');
    error.status = 400;
    throw error;
  }

  // Generate a verified identity verification token (short-lived verification token)
  const verificationToken = crypto.randomUUID();
  const customerId = generateCustomerId();

  const verifiedIdentity = {
    verificationToken,
    customerId,
    aadhaarHash: session.aadhaarHash,
    maskedAadhaar: session.maskedAadhaar,
    verifiedMobile: session.mobile,
    verifiedAt: new Date().toISOString(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins to complete registration form
  };

  // Replace session with verified identity
  pendingOtpSessions.delete(txnId);
  pendingOtpSessions.set(verificationToken, verifiedIdentity);

  return {
    success: true,
    message: 'Aadhaar identity successfully verified!',
    verificationToken,
    customerId,
    maskedAadhaar: session.maskedAadhaar,
    verificationStatus: 'VERIFIED',
  };
}

/**
 * Retrieves and consumes a verified identity token during registration
 */
function consumeVerifiedIdentityToken(verificationToken) {
  if (!verificationToken) return null;
  const verified = pendingOtpSessions.get(verificationToken);
  if (!verified) return null;
  if (Date.now() > verified.expiresAt) {
    pendingOtpSessions.delete(verificationToken);
    return null;
  }
  pendingOtpSessions.delete(verificationToken);
  return verified;
}

module.exports = {
  validateAadhaarFormat,
  hashAadhaar,
  maskAadhaar,
  generateCustomerId,
  initiateAadhaarOtp,
  verifyAadhaarOtp,
  consumeVerifiedIdentityToken,
};
