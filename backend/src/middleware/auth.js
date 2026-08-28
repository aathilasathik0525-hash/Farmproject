const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        name: true,
        isActive: true,
        farmerProfile: { select: { id: true, verificationStatus: true, fpoId: true } },
        buyerProfile: { select: { id: true } },
        fpoProfile: { select: { id: true, fpoId: true } },
        logisticsProfile: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Role-based authorization middleware factory
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

// Ensure farmer owns the resource
const ownsProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { farmerId: true },
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.farmerId !== req.user.farmerProfile?.id) {
      return res.status(403).json({ success: false, message: 'Access denied. Not your product.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, authorize, ownsProduct };
