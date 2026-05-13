const Loan = require('../models/Loan.model');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('../services/notification.service');

// GET /api/admin/stats
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBorrowers,
      totalLenders,
      totalLoans,
      pendingLoans,
      activeLoans,
      completedLoans,
      totalFunded,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'borrower' }),
      User.countDocuments({ role: 'lender' }),
      Loan.countDocuments(),
      Loan.countDocuments({ status: 'pending' }),
      Loan.countDocuments({ status: 'active' }),
      Loan.countDocuments({ status: 'completed' }),
      Transaction.aggregate([
        { $match: { type: 'funding', status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    // Monthly loans for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyLoans = await Loan.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const riskDistribution = await Loan.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, borrowers: totalBorrowers, lenders: totalLenders },
        loans: { total: totalLoans, pending: pendingLoans, active: activeLoans, completed: completedLoans },
        totalFunded: totalFunded[0]?.total || 0,
        monthlyLoans,
        riskDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/loans/:id/status
const updateLoanStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const allowed = ['approved', 'rejected'];
    if (!allowed.includes(status)) {
      throw new ApiError(400, 'Admin can only approve or reject loans');
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) throw new ApiError(404, 'Loan not found');
    if (loan.status !== 'pending') {
      throw new ApiError(400, `Cannot update a ${loan.status} loan`);
    }

    loan.status = status;
    if (adminNote) loan.adminNote = adminNote;
    await loan.save();

    const notifType = status === 'approved' ? 'loan_approved' : 'loan_rejected';
    const notifMsg = status === 'approved'
      ? `Your loan of ₹${loan.amount.toLocaleString()} has been approved!`
      : `Your loan of ₹${loan.amount.toLocaleString()} was rejected. Reason: ${adminNote || 'See platform guidelines'}`;

    await createNotification(loan.borrower, `Loan ${status}`, notifMsg, notifType, `/loans/${loan._id}`);

    res.json({ success: true, message: `Loan ${status} successfully`, loan });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, isBlocked, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/block
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role === 'admin') throw new ApiError(403, 'Cannot block another admin');

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/loans
const getAllLoans = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [loans, total] = await Promise.all([
      Loan.find(filter)
        .populate('borrower', 'name email creditScore')
        .populate('lender', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Loan.countDocuments(filter),
    ]);

    res.json({
      success: true,
      loans,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlatformStats, updateLoanStatus, getAllUsers, toggleBlockUser, getAllLoans };
