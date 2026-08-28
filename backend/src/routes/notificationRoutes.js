const express = require('express');
const {
  getNotifications,
  markAsRead,
  simulateNotification,
  handleVoiceWebhook,
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public IVR Voice Webhook endpoints (called by telecom providers like Exotel/Twilio)
router.post('/webhook/voice', handleVoiceWebhook);
router.post('/ivr/webhook', handleVoiceWebhook);
router.get('/webhook/voice', handleVoiceWebhook);

// Protected in-app routes
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/simulate', simulateNotification);

module.exports = router;
