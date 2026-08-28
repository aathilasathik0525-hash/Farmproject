const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  sendAadhaarOtp,
  verifyAadhaarOtpController,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Aadhaar OTP Verification Endpoints
router.post(
  '/aadhaar/send-otp',
  [
    body('aadhaarNumber').notEmpty().withMessage('Aadhaar number is required'),
  ],
  sendAadhaarOtp
);

router.post(
  '/aadhaar/verify-otp',
  [
    body('txnId').notEmpty().withMessage('Transaction ID is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
  ],
  verifyAadhaarOtpController
);

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['FARMER', 'BUYER', 'CUSTOMER', 'FPO', 'LOGISTICS', 'ADMIN']).withMessage('Valid role is required'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
