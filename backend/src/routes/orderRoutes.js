const express = require('express');
const {
  createOrder,
  validateCheckout,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/validate-checkout', authorize('BUYER', 'ADMIN'), validateCheckout);
router.post('/', authorize('BUYER', 'ADMIN'), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
