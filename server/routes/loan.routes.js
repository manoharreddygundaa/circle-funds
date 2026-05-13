const express = require('express');
const router = express.Router();
const { applyLoan, getLoans, getLoanById, fundLoan } = require('../controllers/loan.controller');
const { applyLoanValidator } = require('../validators/loan.validator');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/role.middleware');

router.use(protect); // All loan routes require auth

router.get('/', getLoans);
router.get('/:id', getLoanById);
router.post('/', restrictTo('borrower'), applyLoanValidator, applyLoan);
router.post('/:id/fund', restrictTo('lender'), fundLoan);

module.exports = router;
