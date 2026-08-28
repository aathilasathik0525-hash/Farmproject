const express = require('express');
const {
  getFPOs,
  getFPOFarmers,
  verifyFarmer,
  createAggregation,
  getCollectionCenters,
  createCollectionCenter,
} = require('../controllers/fpoController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getFPOs);
router.get('/collection-centers', getCollectionCenters);

router.use(authenticate);

router.get('/:id/farmers', getFPOFarmers);
router.patch('/farmers/:farmerId/verify', authorize('FPO', 'ADMIN'), verifyFarmer);
router.post('/aggregation', authorize('FPO', 'ADMIN'), createAggregation);
router.post('/collection-centers', authorize('FPO', 'ADMIN'), createCollectionCenter);

module.exports = router;
