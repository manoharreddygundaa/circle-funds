import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { loanService } from '../../services/loan.service';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { CardSkeleton } from '../../components/ui/Loader';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatCurrency';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function Repayments() {
  const [payingId, setPayingId]   = useState(null);  // tracks which installment is processing
  const [paidIds, setPaidIds]     = useState([]);    // optimistic UI update
  const [error, setError]         = useState('');

  const {
    data,
    loading,
    error: fetchError,
    refetch,
  } = useFetch(() => api.get('/repayments/my'));

  const repayments = data?.repayments || [];

  // Grouped by loan — makes the UI much more readable
  const grouped = repayments.reduce((acc, r) => {
    const loanId = r.loan?._id || r.loan;
    if (!acc[loanId]) acc[loanId] = { loan: r.loan, items: [] };
    acc[loanId].items.push(r);
    return acc;
  }, {});

  const overdue  = repayments.filter((r) => r.status === 'overdue').length;
  const upcoming = repayments.filter((r) => {
    if (r.status !== 'pending') return false;
    const diff = new Date(r.dueDate) - new Date();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
  }).length;

  const handlePay = async (repaymentId) => {
    setPayingId(repaymentId);
    setError('');
    try {
      await loanService.payInstallment(repaymentId);
      // Optimistic: mark as paid locally before refetch
      setPaidIds((prev) => [...prev, repaymentId]);
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPayingId(null);
    }
  };

  const getStatus = (r) =>
    paidIds.includes(r._id) ? 'paid' : r.status;

  const isOverdue = (r) =>
    getStatus(r) === 'pending' && new Date(r.dueDate) < new Date();

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Repayments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and pay your EMI installments</p>
      </div>

      {/* ── Summary Banners ──────────────────────────── */}
      {!loading && (overdue > 0 || upcoming > 0) && (
        <div className="space-y-2">
          {overdue > 0 && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {overdue} overdue payment{overdue > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-500">
                  Late fees are being accrued. Pay now to avoid credit score impact.
                </p>
              </div>
            </div>
          )}
          {upcoming > 0 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>{upcoming}</strong> payment{upcoming > 1 ? 's' : ''} due within 7 days
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Global Error ──────────────────────────────── */}
      {(error || fetchError) && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600">{error || fetchError}</p>
        </div>
      )}

      {/* ── Content ──────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : repayments.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No repayments yet"
          description="Your EMI schedule will appear here once a lender funds your loan."
        />
      ) : (
        <div className="space-y-6">
          {Object.values(grouped).map(({ loan, items }) => {
            const totalPaid    = items.filter((i) => getStatus(i) === 'paid').length;
            const progressPct  = Math.round((totalPaid / items.length) * 100);
            const loanAmount   = loan?.amount ?? 0;

            return (
              <div key={loan?._id ?? 'unknown'} className="card space-y-4">
                {/* Loan header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(loanAmount)} Loan
                    </p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">
                      {loan?.status} · {loan?.interestRate}% p.a.
                    </p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {totalPaid}/{items.length} paid
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{progressPct}% repaid</p>
                </div>

                {/* Installment rows */}
                <div className="space-y-2">
                  {items.map((r) => {
                    const status   = getStatus(r);
                    const late     = isOverdue(r);
                    const isPaying = payingId === r._id;

                    return (
                      <div
                        key={r._id}
                        className={`
                          flex items-center justify-between p-3 rounded-xl border transition
                          ${status === 'paid'
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30'
                            : late
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                            : 'bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700/50'}
                        `}
                      >
                        {/* Left — number + date */}
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                            ${status === 'paid'
                              ? 'bg-green-500 text-white'
                              : late
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300'}
                          `}>
                            {status === 'paid' ? <CheckCircle className="w-4 h-4" /> : r.installmentNumber}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(r.amount)}
                              {r.lateFee > 0 && (
                                <span className="text-xs text-red-500 ml-1">
                                  +{formatCurrency(r.lateFee)} late fee
                                </span>
                              )}
                            </p>
                            <p className={`text-xs flex items-center gap-1 ${late ? 'text-red-500' : 'text-gray-400'}`}>
                              <Calendar className="w-3 h-3" />
                              {late ? 'Overdue · ' : 'Due '}
                              {formatDate(r.dueDate)}
                            </p>
                          </div>
                        </div>

                        {/* Right — status badge or pay button */}
                        <div>
                          {status === 'paid' ? (
                            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {r.paidDate ? formatRelativeTime(r.paidDate) : 'Paid'}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant={late ? 'danger' : 'primary'}
                              loading={isPaying}
                              onClick={() => handlePay(r._id)}
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
