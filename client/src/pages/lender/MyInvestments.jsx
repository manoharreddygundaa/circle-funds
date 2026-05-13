import useLoans from '../../hooks/useLoans';
import { LoanCard } from '../../components/loans/LoanCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { CardSkeleton } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { useState } from 'react';

export default function MyInvestments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  // Lender-specific — backend filters by lender when role=lender
  const { loans, pagination, filters, loading, updateFilter, changePage } = useLoans();

  const handleTab = (tab) => {
    setActiveTab(tab);
    updateFilter('status', tab === 'all' ? '' : tab);
  };

  const totalInvested  = loans.reduce((s, l) => s + l.amount, 0);
  const totalRepayable = loans.reduce((s, l) => s + l.totalRepayable, 0);
  const estProfit      = totalRepayable - totalInvested;

  const tabs = ['all', 'active', 'completed'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Investments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total} total investment{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/lender/browse')}>
          <DollarSign className="w-4 h-4" /> Find More Loans
        </Button>
      </div>

      {/* Summary stats */}
      {!loading && loans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Invested"
            value={formatCurrency(totalInvested)}
            icon={DollarSign}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Est. Total Returns"
            value={formatCurrency(totalRepayable)}
            icon={TrendingUp}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600"
          />
          <StatCard
            title="Est. Net Profit"
            value={formatCurrency(estProfit)}
            icon={CheckCircle}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600"
            subtitle={`${totalInvested > 0 ? Math.round((estProfit / totalInvested) * 100) : 0}% ROI`}
          />
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize
              ${activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loan Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : loans.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No investments yet"
          description="Browse available loan requests and fund your first loan."
          action={() => navigate('/lender/browse')}
          actionLabel="Browse Loans"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loans.map((loan) => (
              <LoanCard key={loan._id} loan={loan} isLender />
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" disabled={filters.page <= 1} onClick={() => changePage(filters.page - 1)}>Previous</Button>
              <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</span>
              <Button variant="secondary" size="sm" disabled={filters.page >= pagination.pages} onClick={() => changePage(filters.page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
