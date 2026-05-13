const express = require('express');
const router = express.Router();
const { getDashboard, getMyTransactions } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/transactions', getMyTransactions);

module.exports = router;
