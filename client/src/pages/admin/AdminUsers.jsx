import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton, CardSkeleton } from '../../components/ui/Loader';
import { EmptyState } from '../../components/shared/EmptyState';
import { RiskScoreBar } from '../../components/shared/RiskScoreBar';
import { formatDate, formatCurrency } from '../../utils/formatCurrency';
import { Users, Search, ShieldOff, ShieldCheck, Filter, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const { toast } = useToast();
  const [roleFilter, setRoleFilter]       = useState('');
  const [blockedFilter, setBlockedFilter] = useState('');
  const [search, setSearch]               = useState('');
  const [togglingId, setTogglingId]       = useState(null);

  const { data, loading, error, refetch } = useFetch(
    () => api.get('/admin/users', { params: { role: roleFilter, isBlocked: blockedFilter } }),
    [roleFilter, blockedFilter]
  );

  const users  = data?.users  || [];
  const visible = search.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleToggleBlock = async (userId) => {
    setTogglingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/block`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {data?.pagination?.total ?? 0} registered users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-base w-auto text-sm"
        >
          <option value="">All Roles</option>
          <option value="borrower">Borrower</option>
          <option value="lender">Lender</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={blockedFilter}
          onChange={(e) => setBlockedFilter(e.target.value)}
          className="input-base w-auto text-sm"
        >
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>

        {(roleFilter || blockedFilter || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setRoleFilter(''); setBlockedFilter(''); setSearch(''); }}>
            <X className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : visible.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try adjusting your filters." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {['User', 'Role', 'Credit Score', 'Loans Applied', 'Missed Payments', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {visible.map((user) => (
                <tr key={user._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition
                  ${user.isBlocked ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">
                          {user.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : user.role === 'lender' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RiskScoreBar score={user.creditScore} compact />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-center">{user.totalLoansApplied}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-medium ${user.missedPayments > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {user.missedPayments}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {user.isBlocked ? (
                      <Badge variant="rejected">Blocked</Badge>
                    ) : (
                      <Badge variant="active">Active</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant={user.isBlocked ? 'success' : 'danger'}
                        loading={togglingId === user._id}
                        onClick={() => handleToggleBlock(user._id)}
                      >
                        {user.isBlocked ? (
                          <><ShieldCheck className="w-3.5 h-3.5" /> Unblock</>
                        ) : (
                          <><ShieldOff className="w-3.5 h-3.5" /> Block</>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
