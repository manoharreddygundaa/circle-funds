const Notification = require('../models/Notification.model');

const createNotification = async (recipientId, title, message, type = 'general', link = '') => {
  try {
    await Notification.create({ recipient: recipientId, title, message, type, link });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
    // Non-critical — don't throw, just log
  }
};

module.exports = { createNotification };
