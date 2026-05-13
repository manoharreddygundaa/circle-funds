const Loan = require('../models/Loan.model');
const Repayment = require('../models/Repayment.model');
const Transaction = require('../models/Transaction.model');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const { calculateRiskScore } = require('../services/riskScore.service');
const { calculateEMI, generateRepaymentSchedule } = require('../services/emi.service');
const { createNotification } = require('../services/notification.service');

// POST /api/loans — Borrower applies for loan
const applyLoan = async (req, res, next) => {
  try {
    const { amount, duration, reason, category } = req.body;
    const borrower = await User.findById(req.user.id);

    // Check for existing active/pending loan
    const activeLoan = await Loan.findOne({
      borrower: req.user.id,
      status: { $in: ['pending', 'approved', 'funded', 'active'] },
    });
    if (activeLoan) {
      throw new ApiError(400, 'You already have an active loan application');
    }

    const { riskScore, riskLevel, suggestedRate } = calculateRiskScore(borrower, amount);
    const emiAmount = calculateEMI(amount, suggestedRate, duration);
    const totalRepayable = Math.round(emiAmount * duration * 100) / 100;

    const loan = await Loan.create({
      borrower: req.user.id,
      amount,
      duration,
      reason,
      category: category || 'personal',
      riskScore,
      riskLevel,
      interestRate: suggestedRate,
      emiAmount,
      totalRepayable,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { totalLoansApplied: 1 } });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      loan,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/loans — List loans (role-based filtering)
const getLoans = async (req, res, next) => {
  try {
    const { status, riskLevel, minAmount, maxAmount, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role === 'borrower') {
      filter.borrower = req.user.id;
    } else if (req.user.role === 'lender') {
      // Lenders see approved loans available for funding
      filter.status = status || 'approved';
    }
    // Admin sees all

    if (status && req.user.role !== 'lender') filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

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
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/loans/:id — Single loan details
const getLoanById = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('borrower', 'name email creditScore totalLoansApplied missedPayments')
      .populate('lender', 'name email');

    if (!loan) throw new ApiError(404, 'Loan not found');

    // Borrowers can only view own loans
    if (req.user.role === 'borrower' && loan.borrower._id.toString() !== req.user.id) {
      throw new ApiError(403, 'Access denied');
    }

    const repayments = await Repayment.find({ loan: loan._id }).sort({ installmentNumber: 1 });

    res.json({ success: true, loan, repayments });
  } catch (err) {
    next(err);
  }
};

// POST /api/loans/:id/fund — Lender funds a loan
const fundLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) throw new ApiError(404, 'Loan not found');
    if (loan.status !== 'approved') throw new ApiError(400, 'Loan is not available for funding');

    // Prevent funding own loan (if someone is both borrower and lender)
    if (loan.borrower.toString() === req.user.id) {
      throw new ApiError(400, 'You cannot fund your own loan');
    }

    // Update loan
    loan.status = 'active';
    loan.lender = req.user.id;
    loan.fundedAt = new Date();

    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + 1);
    loan.nextDueDate = nextDue;
    await loan.save();

    // Generate repayment schedule
    const schedule = generateRepaymentSchedule(loan.amount, loan.interestRate, loan.duration);
    const repaymentDocs = schedule.map(s => ({
      ...s,
      loan: loan._id,
      borrower: loan.borrower,
      lender: req.user.id,
    }));
    await Repayment.insertMany(repaymentDocs);

    // Log transaction
    await Transaction.create({
      from: req.user.id,
      to: loan.borrower,
      loan: loan._id,
      amount: loan.amount,
      type: 'funding',
      description: `Loan funding for ${loan._id}`,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { totalLoansFunded: 1 } });

    // Notify borrower
    await createNotification(
      loan.borrower,
      'Loan Funded! 🎉',
      `Your loan of ₹${loan.amount.toLocaleString()} has been funded.`,
      'loan_funded',
      `/loans/${loan._id}`
    );

    res.json({ success: true, message: 'Loan funded successfully', loan });
  } catch (err) {
    next(err);
  }
};

module.exports = { applyLoan, getLoans, getLoanById, fundLoan };
