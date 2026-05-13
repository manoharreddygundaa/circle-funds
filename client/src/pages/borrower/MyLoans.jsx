import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLoans from '../../hooks/useLoans';
import { LoanCard } from '../../components/loans/LoanCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { CardSkeleton } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RepaymentScheduleTable } from '../../components/loans/RepaymentScheduleTable';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { RiskScoreBar } from '../../components/shared/RiskScoreBar';
import {
  CreditCard, Search, Filter, X,
  DollarSign, Calendar, TrendingUp,
} from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'approved', 'active', 'completed', 'rejected'];

export default function MyLoans() {
  const navigate = useNavigate();
  const [search, setSearch]         = useState('');
  const [activeTab, setActiveTab]   = useState('all');
  const [selectedLoan, setSelectedLoan] = useState(null);

  // useLoans manages filter state + fetching
  const { loans, pagination, filters, loading, error, updateFilter, changePage } = useLoans();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    updateFilter('status', tab === 'all' ? '' : tab);
  };

  // Client-side search on the already-fetched page
  const visible = search.trim()
    ? loans.filter(
        (l) =>
          l.reason?.toLowerCase().includes(search.toLowerCase()) ||
          l.category?.toLowerCase().includes(search.toLowerCase())
      )
    : loans;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Loans</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total} total application{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/borrower/apply')}>
          <CreditCard className="w-4 h-4" /> New Application
        </Button>
      </div>

      {/* ── Status Tabs ─────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition
              ${activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Search Bar ──────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by reason or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Loan Grid ───────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={search ? 'No results found' : `No ${activeTab !== 'all' ? activeTab : ''} loans`}
          description={
            search
              ? 'Try a different search term'
              : 'Apply for a loan to see it here'
          }
          action={!search ? () => navigate('/borrower/apply') : null}
          actionLabel="Apply for Loan"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                onView={() => setSelectedLoan(loan)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => changePage(filters.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page >= pagination.pages}
                onClick={() => changePage(filters.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── Loan Detail Modal ────────────────────────── */}
      <Modal
        isOpen={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
        title="Loan Details"
        size="xl"
      >
        {selectedLoan && (
          <div className="space-y-5">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(selectedLoan.amount)}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  Applied on {formatDate(selectedLoan.createdAt)}
                </p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant={selectedLoan.status}>
                  {selectedLoan.status}
                </Badge>
                <br />
                <Badge variant={selectedLoan.riskLevel}>
                  {selectedLoan.riskLevel} risk
                </Badge>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Calendar,   label: 'Duration',      val: `${selectedLoan.duration} months` },
                { icon: TrendingUp, label: 'Interest Rate',  val: `${selectedLoan.interestRate}% p.a.` },
                { icon: DollarSign, label: 'Monthly EMI',    val: formatCurrency(selectedLoan.emiAmount) },
                { icon: DollarSign, label: 'Total Repayable',val: formatCurrency(selectedLoan.totalRepayable) },
                { icon: CreditCard, label: 'Category',       val: selectedLoan.category },
                { icon: TrendingUp, label: 'Risk Score',      val: selectedLoan.riskScore },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {val}
                  </p>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Loan Purpose</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                {selectedLoan.reason}
              </p>
            </div>

            {/* Admin note if rejected */}
            {selectedLoan.adminNote && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                <p className="text-xs font-semibold text-red-600 mb-1">Admin Note</p>
                <p className="text-sm text-red-700 dark:text-red-300">{selectedLoan.adminNote}</p>
              </div>
            )}

            {/* Repayment schedule if loan is active/funded */}
            {['active', 'completed'].includes(selectedLoan.status) && (
              <RepaymentScheduleTable
                amount={selectedLoan.amount}
                rate={selectedLoan.interestRate}
                duration={selectedLoan.duration}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
