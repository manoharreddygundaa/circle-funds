import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, iconBg = 'bg-blue-100 dark:bg-blue-900/30',
  iconColor = 'text-blue-600 dark:text-blue-400', trend, trendLabel, subtitle }) => (
  <div className="card flex items-start gap-4">
    <div className={`p-3 rounded-xl ${iconBg} shrink-0`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium
          ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}
        >
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend >= 0 ? '+' : ''}{trend}% {trendLabel}
        </div>
      )}
    </div>
  </div>
);
