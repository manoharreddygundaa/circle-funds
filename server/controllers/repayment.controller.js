const Repayment = require('../models/Repayment.model');
const Loan = require('../models/Loan.model');
const Transaction = require('../models/Transaction.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('../services/notification.service');

// GET /api/repayments/my — Borrower's repayment schedule
const getMyRepayments = async (req, res, next) => {
  try {
    const repayments = await Repayment.find({ borrower: req.user.id })
      .populate('loan', 'amount interestRate status')
      .sort({ dueDate: 1 });
    res.json({ success: true, repayments });
  } catch (err) {
    next(err);
  }
};

// POST /api/repayments/:id/pay — Pay an installment
const payInstallment = async (req, res, next) => {
  try {
    const repayment = await Repayment.findById(req.params.id);
    if (!repayment) throw new ApiError(404, 'Repayment not found');
    if (repayment.borrower.toString() !== req.user.id) throw new ApiError(403, 'Access denied');
    if (repayment.status === 'paid') throw new ApiError(400, 'Installment already paid');

    const now = new Date();
    let lateFee = 0;
    if (now > repayment.dueDate) {
      // 2% late fee
      lateFee = Math.round(repayment.amount * 0.02 * 100) / 100;
    }

    repayment.status = 'paid';
    repayment.paidDate = now;
    repayment.lateFee = lateFee;
    await repayment.save();

    const totalPaid = repayment.amount + lateFee;

    // Update loan's amountRepaid
    const loan = await Loan.findByIdAndUpdate(
      repayment.loan,
      { $inc: { amountRepaid: totalPaid } },
      { new: true }
    );

    // Check if all installments paid
    const unpaidCount = await Repayment.countDocuments({
      loan: loan._id,
      status: { $ne: 'paid' },
    });
    if (unpaidCount === 0) {
      await Loan.findByIdAndUpdate(loan._id, { status: 'completed', completedAt: new Date() });
    }

    // Log transaction
    await Transaction.create({
      from: req.user.id,
      to: repayment.lender,
      loan: repayment.loan,
      amount: totalPaid,
      type: 'repayment',
      description: `Installment #${repayment.installmentNumber}`,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { totalRepaid: totalPaid } });

    if (repayment.lender) {
      await createNotification(
        repayment.lender,
        'Repayment Received',
        `Installment #${repayment.installmentNumber} of ₹${repayment.amount} received.`,
        'repayment_received'
      );
    }

    res.json({
      success: true,
      message: 'Payment successful',
      repayment,
      lateFee,
      totalPaid,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/repayments/notifications — User notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/repayments/notifications/read-all
const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyRepayments, payInstallment, getNotifications, markAllNotificationsRead };
