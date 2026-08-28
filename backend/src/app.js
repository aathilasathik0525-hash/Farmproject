require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const fpoRoutes = require('./routes/fpoRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const riskRoutes = require('./routes/riskRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Error handler middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 1. API Root Endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'FarmDirect API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 3. API Route Modules
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/fpos', fpoRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/risk', riskRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/uploads', uploadRoutes);

// Aliases matching prompt requirements
app.use('/api/aggregation', fpoRoutes);
app.use('/api/shipments', logisticsRoutes);

// 404 Handler for undefined routes
app.use(notFound);

// Central error handling middleware
app.use(errorHandler);

module.exports = app;
