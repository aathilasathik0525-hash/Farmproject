const express = require('express');
const {
  getAddressRiskList,
  getAddressDetails,
  updateAddressStatus,
  getPolicy,
  updatePolicy,
} = require('../controllers/riskController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/addresses', getAddressRiskList);
router.get('/addresses/:id', getAddressDetails);
router.patch('/addresses/:id/status', updateAddressStatus);
router.get('/policy', getPolicy);
router.put('/policy', updatePolicy);

module.exports = router;
