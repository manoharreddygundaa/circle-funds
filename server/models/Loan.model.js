const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [1000, 'Minimum loan amount is ₹1,000'],
      max: [500000, 'Maximum loan amount is ₹5,00,000'],
    },
    duration: {
      type: Number, // months
      required: [true, 'Loan duration is required'],
      min: [1, 'Minimum duration is 1 month'],
      max: [60, 'Maximum duration is 60 months'],
    },
    interestRate: {
      type: Number,
      default: 12, // annual %
      min: 1,
      max: 36,
    },
    reason: {
      type: String,
      required: [true, 'Loan reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'funded', 'active', 'completed', 'defaulted'],
      default: 'pending',
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    emiAmount: { type: Number, default: 0 },
    totalRepayable: { type: Number, default: 0 },
    amountRepaid: { type: Number, default: 0 },
    nextDueDate: { type: Date },
    fundedAt: { type: Date },
    completedAt: { type: Date },
    adminNote: { type: String, default: '' },
    // Category
    category: {
      type: String,
      enum: ['personal', 'education', 'medical', 'business', 'home', 'other'],
      default: 'personal',
    },
  },
  { timestamps: true }
);

loanSchema.index({ status: 1, createdAt: -1 });
loanSchema.index({ borrower: 1, status: 1 });

module.exports = mongoose.model('Loan', loanSchema);
