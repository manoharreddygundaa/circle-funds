const express = require('express');
const router = express.Router();
const { getPlatformStats, updateLoanStatus, getAllUsers, toggleBlockUser, getAllLoans } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(protect, restrictTo('admin')); // All admin routes require admin role

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.get('/loans', getAllLoans);
router.patch('/loans/:id/status', updateLoanStatus);
router.patch('/users/:id/block', toggleBlockUser);

module.exports = router;
