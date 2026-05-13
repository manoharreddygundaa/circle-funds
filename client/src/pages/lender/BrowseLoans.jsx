import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLoans from '../../hooks/useLoans';
import { loanService } from '../../services/loan.service';
import { LoanCard } from '../../components/loans/LoanCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { CardSkeleton } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { RepaymentScheduleTable } from '../../components/loans/RepaymentScheduleTable';
import { RiskScoreBar } from '../../components/shared/RiskScoreBar';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { Search, SlidersHorizontal, X, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function BrowseLoans() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch]           = useState('');
  const [fundingId, setFundingId]     = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [fundError, setFundError]     = useState('');
  const [fundSuccess, setFundSuccess] = useState('');

  const {
    loans, pagination, filters, loading, error,
    updateFilter, changePage, resetFilters,
  } = useLoans({ status: 'approved' }); // Lenders only see approved loans

  const handleFund = async (loanId) => {
    setFundingId(loanId);
    setFundError('');
    setFundSuccess('');
    try {
      await loanService.fund(loanId);
      setFundSuccess('Loan funded successfully! The borrower has been notified.');
      setSelectedLoan(null);
      // Small delay then navigate to investments
      setTimeout(() => navigate('/lender/investments'), 1500);
    } catch (err) {
      setFundError(err.response?.data?.message || 'Funding failed. Please try again.');
    } finally {
      setFundingId(null);
    }
  };

  const visible = search.trim()
    ? loans.filter(
        (l) =>
          l.reason?.toLowerCase().includes(search.toLowerCase()) ||
          l.category?.toLowerCase().includes(search.toLowerCase()) ||
          l.borrower?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : loans;

  const hasActiveFilters =
    filters.riskLevel || filters.minAmount || filters.maxAmount;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Loans</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {pagination.total} approved loan{pagination.total !== 1 ? 's' : ''} available for funding
        </p>
      </div>

      {/* ── Success / Error Messages ─────────────────── */}
      {fundSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
          ✅ {fundSuccess}
        </div>
      )}
      {fundError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600">
          {fundError}
        </div>
      )}

      {/* ── Search + Filter Bar ─────────────────────── */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reason, category, or borrower name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-orange-400 rounded-full" />
          )}
        </Button>
      </div>

      {/* ── Filter Panel ─────────────────────────────── */}
      {showFilters && (
        <div className="card grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Risk Level */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Risk Level</label>
            <select
              value={filters.riskLevel || ''}
              onChange={(e) => updateFilter('riskLevel', e.target.value)}
              className="input-base text-sm"
            >
              <option value="">All</option>
              <option value="low">🟢 Low Risk</option>
              <option value="medium">🟡 Medium Risk</option>
              <option value="high">🔴 High Risk</option>
            </select>
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Min Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={filters.minAmount || ''}
              onChange={(e) => updateFilter('minAmount', e.target.value)}
              className="input-base text-sm"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Max Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 100000"
              value={filters.maxAmount || ''}
              onChange={(e) => updateFilter('maxAmount', e.target.value)}
              className="input-base text-sm"
            />
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={() => { resetFilters(); setSearch(''); }}>
              <X className="w-4 h-4" /> Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* ── Loan Grid ───────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="card text-center py-12 text-red-500 text-sm">{error}</div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No loans available"
          description="There are no approved loans matching your filters right now. Check back later."
          action={hasActiveFilters ? resetFilters : null}
          actionLabel="Clear Filters"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                isLender
                onView={() => setSelectedLoan(loan)}
                onFund={(id) => setSelectedLoan(loans.find((l) => l._id === id))}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="secondary" size="sm" disabled={filters.page <= 1} onClick={() => changePage(filters.page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button variant="secondary" size="sm" disabled={filters.page >= pagination.pages} onClick={() => changePage(filters.page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── Loan Detail + Fund Modal ─────────────────── */}
      <Modal
        isOpen={!!selectedLoan}
        onClose={() => { setSelectedLoan(null); setFundError(''); }}
        title="Loan Investment Details"
        size="xl"
      >
        {selectedLoan && (
          <div className="space-y-5">
            {/* Amount + rate hero */}
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Loan Amount</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(selectedLoan.amount)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Applied {formatDate(selectedLoan.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Annual Return</p>
                <p className="text-3xl font-bold text-blue-600">
                  {selectedLoan.interestRate}%
                </p>
                <p className="text-xs text-gray-400">per annum</p>
              </div>
            </div>

            {/* Borrower credit score */}
            {selectedLoan.borrower?.creditScore && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Borrower Credit Profile — {selectedLoan.borrower.name}
                </p>
                <RiskScoreBar score={selectedLoan.borrower.creditScore} />
              </div>
            )}

            {/* Loan metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Calendar,   label: 'Duration',    val: `${selectedLoan.duration} mo` },
                { icon: TrendingUp, label: 'Monthly EMI', val: formatCurrency(selectedLoan.emiAmount) },
                { icon: DollarSign, label: 'You Receive', val: formatCurrency(selectedLoan.totalRepayable) },
                { icon: DollarSign, label: 'Net Profit',  val: formatCurrency(selectedLoan.totalRepayable - selectedLoan.amount) },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{val}</p>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Borrower's Reason</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg italic">
                "{selectedLoan.reason}"
              </p>
            </div>

            {/* Repayment schedule preview */}
            <RepaymentScheduleTable
              amount={selectedLoan.amount}
              rate={selectedLoan.interestRate}
              duration={selectedLoan.duration}
            />

            {fundError && (
              <p className="text-sm text-red-600 text-center">{fundError}</p>
            )}

            {/* Fund button */}
            <Button
              variant="success"
              fullWidth
              size="lg"
              loading={fundingId === selectedLoan._id}
              onClick={() => handleFund(selectedLoan._id)}
            >
              <DollarSign className="w-4 h-4" />
              Fund {formatCurrency(selectedLoan.amount)} — Earn {formatCurrency(selectedLoan.totalRepayable - selectedLoan.amount)}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              By funding, you agree to the lending terms. Funds are transferred to the borrower immediately.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
