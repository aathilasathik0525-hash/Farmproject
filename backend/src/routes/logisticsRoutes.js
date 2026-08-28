const express = require('express');
const {
  getShipments,
  getVehicles,
  createShipment,
  updateShipmentStatus,
} = require('../controllers/logisticsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/shipments', getShipments);
router.get('/vehicles', getVehicles);
router.post('/shipments', authorize('LOGISTICS', 'ADMIN', 'FPO'), createShipment);
router.patch('/shipments/:id/status', authorize('LOGISTICS', 'ADMIN'), updateShipmentStatus);

module.exports = router;
