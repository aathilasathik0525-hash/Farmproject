const express = require('express');
const { createPayment, verify } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/create-order', createPayment);
router.post('/verify', verify);

module.exports = router;
