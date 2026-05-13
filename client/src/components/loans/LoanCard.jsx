import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { TrendingUp, Calendar, User, Tag } from 'lucide-react';

export const LoanCard = ({ loan, onFund, onView, isLender = false }) => {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(loan.amount)}
            </span>
            <Badge variant={loan.riskLevel}>{loan.riskLevel} risk</Badge>
          </div>
          <Badge variant={loan.status}>{loan.status}</Badge>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{loan.interestRate}%</p>
          <p className="text-xs text-gray-500">per annum</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{loan.duration} months</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>EMI: {formatCurrency(loan.emiAmount)}</span>
        </div>
        {loan.borrower?.name && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4 shrink-0" />
            <span>{loan.borrower.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Tag className="w-4 h-4 shrink-0" />
          <span className="capitalize">{loan.category}</span>
        </div>
      </div>

      {/* Reason */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
        "{loan.reason}"
      </p>

      {/* Credit Score Bar (for lenders) */}
      {isLender && loan.borrower?.creditScore && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Credit Score</span>
            <span className="font-medium">{loan.borrower.creditScore}</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full"
              style={{ width: `${((loan.borrower.creditScore - 300) / 600) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400">{formatDate(loan.createdAt)}</span>
        <div className="flex gap-2">
          {onView && (
            <Button variant="secondary" size="sm" onClick={() => onView(loan._id)}>
              Details
            </Button>
          )}
          {isLender && loan.status === 'approved' && onFund && (
            <Button variant="primary" size="sm" onClick={() => onFund(loan._id)}>
              Fund Loan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
