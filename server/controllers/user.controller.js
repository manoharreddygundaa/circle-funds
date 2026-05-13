const User = require('../models/User.model');
const Loan = require('../models/Loan.model');
const Transaction = require('../models/Transaction.model');
const ApiError = require('../utils/ApiError');

// GET /api/users/dashboard — Role-aware dashboard data
const getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');

    let dashData = { user: user.toSafeObject() };

    if (user.role === 'borrower') {
      const loans = await Loan.find({ borrower: req.user.id }).sort({ createdAt: -1 }).limit(5);
      const loanStats = await Loan.aggregate([
        { $match: { borrower: user._id } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]);
      dashData = { ...dashData, loans, loanStats };
    } else if (user.role === 'lender') {
      const myFundedLoans = await Loan.find({ lender: req.user.id, status: { $in: ['active', 'completed'] } })
        .populate('borrower', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);
      const totalInvested = myFundedLoans.reduce((sum, l) => sum + l.amount, 0);
      dashData = { ...dashData, myFundedLoans, totalInvested };
    }

    res.json({ success: true, ...dashData });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/transactions
const getMyTransactions = async (req, res, next) => {
  try {
    const filter = {
      $or: [{ from: req.user.id }, { to: req.user.id }],
    };
    const transactions = await Transaction.find(filter)
      .populate('loan', 'amount')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getMyTransactions };
