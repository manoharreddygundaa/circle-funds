const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(422, 'Validation failed', errors.array()));
  }
  next();
};

const applyLoanValidator = [
  body('amount').isNumeric().withMessage('Amount must be a number')
    .custom(val => {
      if (val < 1000) throw new Error('Minimum loan amount is ₹1,000');
      if (val > 500000) throw new Error('Maximum loan amount is ₹5,00,000');
      return true;
    }),
  body('duration').isInt({ min: 1, max: 60 }).withMessage('Duration must be between 1-60 months'),
  body('reason').trim().notEmpty().withMessage('Loan reason is required')
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
  body('category').optional()
    .isIn(['personal', 'education', 'medical', 'business', 'home', 'other'])
    .withMessage('Invalid category'),
  handleValidation,
];

module.exports = { applyLoanValidator };
