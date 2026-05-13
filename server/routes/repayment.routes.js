const express = require('express');
const router = express.Router();
const { getMyRepayments, payInstallment, getNotifications, markAllNotificationsRead } = require('../controllers/repayment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/my', getMyRepayments);
router.post('/:id/pay', payInstallment);
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);

module.exports = router;
