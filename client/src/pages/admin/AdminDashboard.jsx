import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { StatCard } from '../../components/shared/StatCard';
import { AreaChartWidget } from '../../components/charts/AreaChartWidget';
import { PieChartWidget } from '../../components/charts/PieChartWidget';
import { CardSkeleton, Skeleton } from '../../components/ui/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { Users, CreditCard, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const { data, loading } = useFetch(() => api.get('/admin/stats'));

  const stats = data?.stats;

  const monthlyChartData = (stats?.monthlyLoans || []).map((m) => ({
    month: `${MONTH_NAMES[m._id.month]} ${m._id.year}`,
    loans: m.count,
    amount: m.totalAmount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time analytics for Circle Funds</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users"     value={stats?.users?.total      ?? 0} icon={Users}       iconBg="bg-blue-100 dark:bg-blue-900/30"   iconColor="text-blue-600" />
            <StatCard title="Total Loans"     value={stats?.loans?.total      ?? 0} icon={CreditCard}  iconBg="bg-indigo-100 dark:bg-indigo-900/30" iconColor="text-indigo-600" />
            <StatCard title="Total Funded"    value={formatCurrency(stats?.totalFunded ?? 0)} icon={DollarSign} iconBg="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600" />
            <StatCard title="Active Loans"    value={stats?.loans?.active     ?? 0} icon={TrendingUp}  iconBg="bg-yellow-100 dark:bg-yellow-900/30" iconColor="text-yellow-600" />
            <StatCard title="Pending Review"  value={stats?.loans?.pending    ?? 0} icon={Clock}       iconBg="bg-orange-100 dark:bg-orange-900/30" iconColor="text-orange-600" />
            <StatCard title="Completed Loans" value={stats?.loans?.completed  ?? 0} icon={CheckCircle} iconBg="bg-purple-100 dark:bg-purple-900/30" iconColor="text-purple-600" />
          </div>

          {/* User breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card flex items-center gap-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <Users className="w-10 h-10 opacity-80" />
              <div>
                <p className="text-blue-100 text-sm">Borrowers</p>
                <p className="text-3xl font-bold">{stats?.users?.borrowers ?? 0}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4 bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <TrendingUp className="w-10 h-10 opacity-80" />
              <div>
                <p className="text-green-100 text-sm">Lenders</p>
                <p className="text-3xl font-bold">{stats?.users?.lenders ?? 0}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Loans Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Loan Volume</h2>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : monthlyChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No data yet
            </div>
          ) : (
            <AreaChartWidget
              data={monthlyChartData}
              dataKey="loans"
              xKey="month"
              color="#3b82f6"
              height={200}
            />
          )}
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Risk Distribution</h2>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : !stats?.riskDistribution?.length ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No data yet
            </div>
          ) : (
            <PieChartWidget data={stats.riskDistribution} />
          )}
        </div>
      </div>
    </div>
  );
}
