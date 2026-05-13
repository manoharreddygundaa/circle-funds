import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { StatCard } from '../../components/shared/StatCard';
import { LoanCard } from '../../components/loans/LoanCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { CardSkeleton, Skeleton } from '../../components/ui/Loader';
import { AreaChartWidget } from '../../components/charts/AreaChartWidget';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  DollarSign, TrendingUp, Users,
  BarChart3, Search, PlusCircle,
} from 'lucide-react';

// Mock monthly returns data — in production this would come from the API
const buildReturnChart = (fundedLoans = []) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, i) => ({
    month,
    returns: Math.round(fundedLoans.length * (i + 1) * 180),
  }));
};

export default function LenderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, loading } = useFetch(() => api.get('/users/dashboard'));

  const fundedLoans    = data?.myFundedLoans  || [];
  const totalInvested  = data?.totalInvested  || 0;
  const activeCount    = fundedLoans.filter((l) => l.status === 'active').length;
  const completedCount = fundedLoans.filter((l) => l.status === 'completed').length;

  // Estimated returns (simplified — real would use transaction records)
  const estimatedReturns = Math.round(totalInvested * 0.14);

  const chartData = buildReturnChart(fundedLoans);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lender Overview 📈
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.name?.split(' ')[0]}
          </p>
        </div>
        <button
          onClick={() => navigate('/lender/browse')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Search className="w-4 h-4" /> Browse Loans
        </button>
      </div>

      {/* ── Investment Banner ──────────────────────── */}
      <div className="card bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-green-100 text-sm mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-bold">{formatCurrency(totalInvested)}</p>
            <p className="text-green-100 text-sm mt-1">
              Estimated annual returns:{' '}
              <strong className="text-white">{formatCurrency(estimatedReturns)}</strong>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100">Avg. return rate</p>
            <p className="text-3xl font-bold">14%</p>
            <p className="text-xs text-green-200">per annum</p>
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
            title="Total Invested"
            value={formatCurrency(totalInvested)}
            icon={DollarSign}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600"
          />
          <StatCard
            title="Loans Funded"
            value={fundedLoans.length}
            icon={BarChart3}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Active Loans"
            value={activeCount}
            icon={TrendingUp}
            iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            iconColor="text-yellow-600"
            subtitle="Earning returns"
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={Users}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600"
            subtitle="Fully repaid"
          />
        </div>
      )}

      {/* ── Chart + Recent ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Returns Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Estimated Monthly Returns
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
              Last 6 months
            </span>
          </div>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <AreaChartWidget
              data={chartData}
              dataKey="returns"
              xKey="month"
              color="#22c55e"
              formatter={(v) => formatCurrency(v)}
              height={200}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Actions</h2>
          {[
            {
              label: 'Browse Available Loans',
              desc: 'Find new investment opportunities',
              icon: Search,
              path: '/lender/browse',
              color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
            },
            {
              label: 'My Investments',
              desc: 'Track funded loans and returns',
              icon: BarChart3,
              path: '/lender/investments',
              color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
            },
          ].map(({ label, desc, icon: Icon, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left group"
            >
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent Investments ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Recent Investments
          </h2>
          <button
            onClick={() => navigate('/lender/investments')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(2).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : fundedLoans.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No investments yet"
            description="Browse available loan requests and start earning competitive returns."
            action={() => navigate('/lender/browse')}
            actionLabel="Browse Loans"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fundedLoans.slice(0, 4).map((loan) => (
              <LoanCard
                key={loan._id}
                loan={loan}
                isLender
                onView={() => navigate(`/lender/investments`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
