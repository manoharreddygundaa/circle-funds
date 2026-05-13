/**
 * Seed Script — creates demo data for development/testing.
 * Run with: node scripts/seed.js
 *
 * Creates:
 *   - 1 Admin account
 *   - 1 Borrower account
 *   - 1 Lender account
 *   - 3 sample loans in various states
 *   - Sample notifications
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const User         = require('../models/User.model');
const Loan         = require('../models/Loan.model');
const Repayment    = require('../models/Repayment.model');
const Notification = require('../models/Notification.model');
const Transaction  = require('../models/Transaction.model');

const { calculateEMI, generateRepaymentSchedule } = require('../services/emi.service');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI not set in .env');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');

  // ── Wipe existing seed data ──────────────────────
  console.log('🗑   Clearing old seed data...');
  await Promise.all([
    User.deleteMany({ email: { $in: ['admin@demo.com', 'borrower@demo.com', 'lender@demo.com'] } }),
  ]);

  // ── Create Users ──────────────────────────────────
  console.log('👤  Creating demo users...');

  const [admin, borrower, lender] = await Promise.all([
    User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'Demo1234',
      role: 'admin',
      isVerified: true,
      creditScore: 800,
    }),
    User.create({
      name: 'Alice Borrower',
      email: 'borrower@demo.com',
      password: 'Demo1234',
      role: 'borrower',
      isVerified: true,
      creditScore: 680,
      totalLoansApplied: 2,
      missedPayments: 0,
    }),
    User.create({
      name: 'Bob Lender',
      email: 'lender@demo.com',
      password: 'Demo1234',
      role: 'lender',
      isVerified: true,
      creditScore: 760,
      totalLoansFunded: 3,
    }),
  ]);
  console.log(`   ✓ admin@demo.com  (Admin)`);
  console.log(`   ✓ borrower@demo.com  (Borrower)`);
  console.log(`   ✓ lender@demo.com    (Lender)`);

  // ── Create Loans ──────────────────────────────────
  console.log('💳  Creating demo loans...');

  // Loan 1: pending — awaiting admin review
  const loan1 = await Loan.create({
    borrower:     borrower._id,
    amount:       75000,
    duration:     18,
    interestRate: 14,
    reason:       'Need funds to expand my small tailoring business. Plan to buy 2 new sewing machines and hire one assistant.',
    category:     'business',
    status:       'pending',
    riskLevel:    'medium',
    riskScore:    42,
    emiAmount:    calculateEMI(75000, 14, 18),
    totalRepayable: Math.round(calculateEMI(75000, 14, 18) * 18 * 100) / 100,
  });

  // Loan 2: approved — ready for lender to fund
  const emi2 = calculateEMI(50000, 12, 12);
  const loan2 = await Loan.create({
    borrower:     borrower._id,
    amount:       50000,
    duration:     12,
    interestRate: 12,
    reason:       'Medical emergency. My father needs knee replacement surgery not covered by insurance.',
    category:     'medical',
    status:       'approved',
    riskLevel:    'low',
    riskScore:    22,
    emiAmount:    emi2,
    totalRepayable: Math.round(emi2 * 12 * 100) / 100,
    adminNote:    'Verified medical records. Good repayment history.',
  });

  // Loan 3: active — funded by lender, repayments in progress
  const emi3 = calculateEMI(30000, 10, 6);
  const loan3 = await Loan.create({
    borrower:     borrower._id,
    lender:       lender._id,
    amount:       30000,
    duration:     6,
    interestRate: 10,
    reason:       'Paying college semester fees for my engineering degree.',
    category:     'education',
    status:       'active',
    riskLevel:    'low',
    riskScore:    18,
    emiAmount:    emi3,
    totalRepayable: Math.round(emi3 * 6 * 100) / 100,
    fundedAt:     new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    amountRepaid: emi3 * 2, // 2 EMIs already paid
  });

  // ── Create Repayment schedule for active loan ────
  const schedule = generateRepaymentSchedule(30000, 10, 6, new Date(Date.now() - 60 * 24 * 60 * 60 * 1000));
  const repaymentDocs = schedule.map((s, idx) => ({
    ...s,
    loan:    loan3._id,
    borrower: borrower._id,
    lender:  lender._id,
    status:  idx < 2 ? 'paid' : (idx === 2 && new Date(s.dueDate) < new Date() ? 'overdue' : 'pending'),
    paidDate: idx < 2 ? new Date(Date.now() - (60 - idx * 30) * 24 * 60 * 60 * 1000) : undefined,
  }));
  await Repayment.insertMany(repaymentDocs);

  // ── Transactions ──────────────────────────────────
  await Transaction.create({
    from: lender._id,
    to:   borrower._id,
    loan: loan3._id,
    amount: 30000,
    type: 'funding',
    status: 'success',
    description: 'Loan funding',
  });

  // ── Notifications ─────────────────────────────────
  console.log('🔔  Creating demo notifications...');
  await Notification.insertMany([
    {
      recipient: borrower._id,
      title: 'Welcome to Circle Funds!',
      message: 'Your account is ready. Apply for a loan to get started.',
      type: 'general',
      isRead: true,
    },
    {
      recipient: borrower._id,
      title: 'Loan Funded! 🎉',
      message: `Your education loan of ₹30,000 has been funded. EMI starts next month.`,
      type: 'loan_funded',
      isRead: false,
    },
    {
      recipient: borrower._id,
      title: 'Loan Approved ✅',
      message: 'Your medical loan application for ₹50,000 has been approved.',
      type: 'loan_approved',
      isRead: false,
    },
    {
      recipient: lender._id,
      title: 'Repayment Received 💸',
      message: 'Installment #2 of ₹5,246 received from Alice Borrower.',
      type: 'repayment_received',
      isRead: false,
    },
    {
      recipient: lender._id,
      title: 'Welcome, Lender! 🚀',
      message: 'Browse available loans and start earning competitive returns.',
      type: 'general',
      isRead: true,
    },
    {
      recipient: admin._id,
      title: 'New Loan Application',
      message: 'Alice Borrower applied for a ₹75,000 business loan. Pending review.',
      type: 'admin_alert',
      isRead: false,
    },
  ]);

  // ── Update user stats ─────────────────────────────
  await User.findByIdAndUpdate(borrower._id, { totalLoansApplied: 3 });
  await User.findByIdAndUpdate(lender._id,   { totalLoansFunded: 1 });

  console.log('\n✅  Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Demo Credentials');
  console.log('  ─────────────────');
  console.log('  Admin:    admin@demo.com     / Demo1234');
  console.log('  Borrower: borrower@demo.com  / Demo1234');
  console.log('  Lender:   lender@demo.com    / Demo1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
