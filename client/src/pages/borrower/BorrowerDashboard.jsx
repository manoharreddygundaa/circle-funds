import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { StatCard } from '../../components/shared/StatCard';
import { LoanCard } from '../../components/loans/LoanCard';
import { RiskScoreBar } from '../../components/shared/RiskScoreBar';
import { EMICalculator } from '../../components/loans/EMICalculator';
import { EmptyState } from '../../components/shared/EmptyState';
import { CardSkeleton, Skeleton } from '../../components/ui/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  CreditCard, PlusCircle, TrendingUp,
  CheckCircle, Clock, XCircle, DollarSign,
} from 'lucide-react';

// ── Helper: derive stat numbers from the loanStats aggregate array
// The backend returns: [{ _id: 'pending', count: 2, total: 80000 }, ...]
const extractStat = (stats = [], status) =>
  stats.find((s) => s._id === status) ?? { count: 0, total: 0 };

export default function BorrowerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Single API call returns { user, loans, loanStats }
  const { data, loading, error } = useFetch(() => api.get('/users/dashboard'));

  const stats      = data?.loanStats || [];
  const recentLoans = data?.loans    || [];

  const pending   = extractStat(stats, 'pending');
  const active    = extractStat(stats, 'active');
  const completed = extractStat(stats, 'completed');
  const totalBorrowed = stats.reduce((s, r) => s + (r.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here's your financial overview
          </p>
        </div>
        <button
          onClick={() => navigate('/borrower/apply')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Apply for Loan
        </button>
      </div>

      {/* ── Credit Score Card ────────────────────────── */}
      <div className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Your Credit Score</p>
            <p className="text-5xl font-bold">{user?.creditScore ?? 600}</p>
            <p className="text-blue-100 text-sm mt-1">
              {user?.creditScore >= 700
                ? '🟢 Excellent — eligible for low-interest loans'
                : user?.creditScore >= 550
                ? '🟡 Fair — medium-risk tier'
                : '🔴 Needs improvement — work on repayments'}
            </p>
          </div>
          <div className="sm:w-56">
            {loading ? (
              <Skeleton className="h-10 w-full bg-blue-500/40" />
            ) : (
              <RiskScoreBar score={user?.creditScore ?? 600} showLabel={false} />
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Borrowed"
            value={formatCurrency(totalBorrowed)}
            icon={DollarSign}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Active Loans"
            value={active.count}
            icon={TrendingUp}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            subtitle={active.count ? `${formatCurrency(active.total)} outstanding` : 'No active loans'}
          />
          <StatCard
            title="Pending Review"
            value={pending.count}
            icon={Clock}
            iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            iconColor="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            title="Completed"
            value={completed.count}
            icon={CheckCircle}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
          />
        </div>
      )}

      {/* ── Main Grid: Recent Loans + EMI Calculator ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Loans — takes 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Recent Loan Applications
            </h2>
            <button
              onClick={() => navigate('/borrower/loans')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="card text-center py-8">
              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : recentLoans.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No loans yet"
              description="Apply for your first loan to get started. Funds are typically approved within 24 hours."
              action={() => navigate('/borrower/apply')}
              actionLabel="Apply for Loan"
            />
          ) : (
            recentLoans.map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                onView={(id) => navigate(`/borrower/loans?id=${id}`)}
              />
            ))
          )}
        </div>

        {/* EMI Calculator sidebar — takes 1/3 */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            EMI Calculator
          </h2>
          <EMICalculator
            onApply={({ amount, duration }) =>
              navigate(`/borrower/apply?amount=${amount}&duration=${duration}`)
            }
          />
        </div>
      </div>

      {/* ── Quick Action Cards ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Apply for Loan',
            desc: 'Get funded in as little as 24 hours',
            icon: PlusCircle,
            color: 'from-blue-500 to-blue-600',
            path: '/borrower/apply',
          },
          {
            title: 'My Loans',
            desc: 'Track all your loan applications',
            icon: CreditCard,
            color: 'from-indigo-500 to-indigo-600',
            path: '/borrower/loans',
          },
          {
            title: 'Repayments',
            desc: 'View upcoming EMI schedule',
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
            path: '/borrower/repayments',
          },
        ].map(({ title, desc, icon: Icon, color, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`
              bg-gradient-to-br ${color} text-white rounded-xl p-5 text-left
              hover:shadow-lg hover:scale-[1.02] transition-all duration-200
            `}
          >
            <Icon className="w-7 h-7 mb-3 opacity-90" />
            <p className="font-semibold text-base">{title}</p>
            <p className="text-xs text-white/75 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
