import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CreditCard, PlusCircle, TrendingUp,
  Users, Settings, LogOut, ChevronRight, DollarSign,
  BarChart3, Shield
} from 'lucide-react';

const navItems = {
  borrower: [
    { to: '/borrower/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/borrower/apply',     icon: PlusCircle,      label: 'Apply for Loan' },
    { to: '/borrower/loans',     icon: CreditCard,      label: 'My Loans' },
    { to: '/borrower/repayments',icon: TrendingUp,      label: 'Repayments' },
  ],
  lender: [
    { to: '/lender/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lender/browse',      icon: DollarSign,      label: 'Browse Loans' },
    { to: '/lender/investments', icon: TrendingUp,      label: 'My Investments' },
  ],
  admin: [
    { to: '/admin/dashboard',    icon: BarChart3,       label: 'Overview' },
    { to: '/admin/loans',        icon: CreditCard,      label: 'Manage Loans' },
    { to: '/admin/users',        icon: Users,           label: 'Manage Users' },
    { to: '/admin/reports',      icon: Shield,          label: 'Reports' },
  ],
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const items = navItems[user?.role] || [];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 z-30
        border-r border-gray-100 dark:border-gray-700 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Circle Funds</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role} Account</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Settings className="w-4 h-4" />
            Settings
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
