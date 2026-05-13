const variants = {
  pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  rejected:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  funded:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  active:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  defaulted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  low:       'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high:      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  paid:      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  overdue:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  default:   'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
    ${variants[variant] || variants.default}
    ${className}
  `}>
    {children}
  </span>
);
