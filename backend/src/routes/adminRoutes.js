const express = require('express');
const { getAdminAnalytics, getUsers } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getUsers);

module.exports = router;
