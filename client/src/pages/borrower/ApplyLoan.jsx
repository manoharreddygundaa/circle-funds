import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loanService } from '../../services/loan.service';
import { EMICalculator } from '../../components/loans/EMICalculator';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  CheckCircle, AlertCircle, Info,
  ChevronRight, ChevronLeft,
} from 'lucide-react';

// ── Step definitions ────────────────────────────────────────────────────────
// Multi-step form: break a long form into digestible chunks.
// Each step validates only its own fields before moving on.
const STEPS = [
  { id: 1, title: 'Loan Details',    subtitle: 'Amount and duration' },
  { id: 2, title: 'Purpose',         subtitle: 'Why do you need it?' },
  { id: 3, title: 'Review & Submit', subtitle: 'Confirm and apply'   },
];

const CATEGORIES = [
  { value: 'personal',  label: '🙍 Personal' },
  { value: 'education', label: '🎓 Education' },
  { value: 'medical',   label: '🏥 Medical' },
  { value: 'business',  label: '💼 Business' },
  { value: 'home',      label: '🏠 Home Improvement' },
  { value: 'other',     label: '📦 Other' },
];

export default function ApplyLoan() {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // Pre-fill from EMI Calculator "Apply with these values" button
  const [form, setForm] = useState({
    amount:   Number(params.get('amount'))   || 50000,
    duration: Number(params.get('duration')) || 12,
    category: 'personal',
    reason:   '',
  });
  const [errors, setErrors] = useState({});

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === 'amount' || name === 'duration' ? Number(value) : value,
    }));
    // Clear field error on change
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  // ── Per-step validation ─────────────────────────────
  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.amount || form.amount < 1000)
        errs.amount = 'Minimum loan amount is ₹1,000';
      if (form.amount > 500000)
        errs.amount = 'Maximum loan amount is ₹5,00,000';
      if (!form.duration || form.duration < 1)
        errs.duration = 'Minimum duration is 1 month';
      if (form.duration > 60)
        errs.duration = 'Maximum duration is 60 months';
    }
    if (s === 2) {
      if (!form.reason.trim())
        errs.reason = 'Please describe why you need this loan';
      if (form.reason.trim().length < 20)
        errs.reason = 'Please provide more detail (at least 20 characters)';
      if (form.reason.length > 500)
        errs.reason = 'Reason cannot exceed 500 characters';
    }
    return errs;
  };

  const nextStep = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const submit = async () => {
    setApiError('');
    setLoading(true);
    try {
      await loanService.apply({
        amount:   form.amount,
        duration: form.duration,
        reason:   form.reason,
        category: form.category,
      });
      setSuccess(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────
  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Application Submitted!
        </h2>
        <p className="text-gray-500 mb-2">
          Your loan application for{' '}
          <strong className="text-gray-900 dark:text-white">
            {formatCurrency(form.amount)}
          </strong>{' '}
          is under review.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Our team typically reviews applications within 24 hours. You'll be notified once a decision is made.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/borrower/loans')}>
            View My Loans
          </Button>
          <Button variant="primary" onClick={() => { setSuccess(false); setStep(1); setForm({ amount: 50000, duration: 12, category: 'personal', reason: '' }); }}>
            Apply Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Page Header ─────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Apply for a Loan</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fill in the details below. Your credit score determines the interest rate.
        </p>
      </div>

      {/* ── Step Indicator ──────────────────────────── */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`flex-1 h-px w-8 ${step > i ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
            <div className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step === s.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : step > s.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}
              `}>
                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-semibold ${step === s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                  {s.title}
                </p>
                <p className="text-xs text-gray-400">{s.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Form Panel — 3/5 on desktop */}
        <div className="lg:col-span-3 card space-y-6">

          {/* STEP 1 — Loan Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900 dark:text-white">Loan Details</h3>

              {/* Amount — number input + slider together */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loan Amount
                  </label>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(form.amount)}
                  </span>
                </div>
                <input
                  type="range"
                  name="amount"
                  min={1000} max={500000} step={1000}
                  value={form.amount}
                  onChange={handle}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex gap-3">
                  <Input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handle}
                    error={errors.amount}
                    placeholder="Enter amount"
                    min={1000} max={500000}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Min: ₹1,000</span><span>Max: ₹5,00,000</span>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Repayment Period
                  </label>
                  <span className="text-lg font-bold text-blue-600">
                    {form.duration} months
                  </span>
                </div>
                <input
                  type="range"
                  name="duration"
                  min={1} max={60} step={1}
                  value={form.duration}
                  onChange={handle}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                {/* Quick duration presets */}
                <div className="flex gap-2 flex-wrap">
                  {[3, 6, 12, 24, 36].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, duration: m }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition
                        ${form.duration === m
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                    >
                      {m}mo
                    </button>
                  ))}
                </div>
                {errors.duration && (
                  <p className="text-xs text-red-500">{errors.duration}</p>
                )}
              </div>

              {/* Category */}
              <Select
                label="Loan Category"
                name="category"
                value={form.category}
                onChange={handle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>

              {/* Info banner */}
              <div className="flex gap-2.5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Your interest rate (shown in the preview) is automatically determined by your
                  credit score and loan history. Improving your repayment history lowers your rate.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2 — Purpose */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900 dark:text-white">Loan Purpose</h3>

              {/* Category visual selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: c.value }))}
                      className={`
                        p-3 rounded-xl text-sm text-center border-2 transition-all
                        ${form.category === c.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}
                      `}
                    >
                      <div className="text-xl mb-1">{c.label.split(' ')[0]}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {c.value}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                label="Describe your need"
                name="reason"
                value={form.reason}
                onChange={handle}
                error={errors.reason}
                placeholder="Explain why you need this loan, how you plan to use the funds, and how you'll repay it..."
                rows={5}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{form.reason.length}/500 characters</span>
                <span className={form.reason.length < 20 ? 'text-red-400' : 'text-green-500'}>
                  {form.reason.length < 20 ? `${20 - form.reason.length} more chars needed` : '✓ Looks good'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="font-semibold text-gray-900 dark:text-white">Review Your Application</h3>

              <div className="space-y-3">
                {[
                  { label: 'Loan Amount',      value: formatCurrency(form.amount)  },
                  { label: 'Duration',          value: `${form.duration} months`    },
                  { label: 'Category',          value: form.category                },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 font-medium">Loan Reason</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{form.reason}</p>
              </div>

              {apiError && (
                <div className="flex gap-2.5 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
                </div>
              )}

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  ⚠️ By submitting, you agree that all information provided is accurate.
                  Fraudulent applications may result in account suspension.
                </p>
              </div>
            </div>
          )}

          {/* ── Navigation Buttons ─────────────────── */}
          <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={step === 1 ? () => navigate('/borrower/dashboard') : prevStep}
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            {step < 3 ? (
              <Button variant="primary" onClick={nextStep}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="primary" onClick={submit} loading={loading}>
                <CheckCircle className="w-4 h-4" />
                Submit Application
              </Button>
            )}
          </div>
        </div>

        {/* EMI Preview Panel — 2/5 on desktop */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Live Preview
            </h3>
            {/* Pass current form values so preview updates live as user types */}
            <EMICalculator
              defaultAmount={form.amount}
              defaultDuration={form.duration}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
