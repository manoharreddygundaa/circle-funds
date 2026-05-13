const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['funding', 'repayment', 'refund', 'fee'],
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
    },
    description: { type: String, default: '' },
    reference: { type: String, default: '' },
  },
  { timestamps: true }
);

transactionSchema.index({ from: 1, createdAt: -1 });
transactionSchema.index({ loan: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
