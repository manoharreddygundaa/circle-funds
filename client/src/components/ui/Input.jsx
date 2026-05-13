export const Input = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-4 py-2.5 rounded-lg border text-sm transition
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
        placeholder-gray-400 dark:placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${error
          ? 'border-red-400 dark:border-red-500'
          : 'border-gray-300 dark:border-gray-600'}
        ${className}
      `}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <select
      className={`
        w-full px-4 py-2.5 rounded-lg border text-sm transition
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <textarea
      className={`
        w-full px-4 py-2.5 rounded-lg border text-sm transition resize-none
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
        ${className}
      `}
      rows={4}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
