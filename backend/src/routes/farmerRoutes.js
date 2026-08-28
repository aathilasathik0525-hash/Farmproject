const express = require('express');
const {
  getPublicFarmers,
  getFarmerById,
  getFarmerDashboard,
  getFarmerEarnings,
} = require('../controllers/farmerController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes for customer marketplace browsing
router.get('/', getPublicFarmers);
router.get('/dashboard', authenticate, getFarmerDashboard);
router.get('/earnings', authenticate, getFarmerEarnings);
router.get('/:id', getFarmerById);

module.exports = router;
