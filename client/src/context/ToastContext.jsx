import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   TOAST CONTEXT
   Usage:
     const { toast } = useToast();
     toast.success('Saved!');
     toast.error('Something went wrong');
     toast.info('Loading...');
     toast.warning('Please review this');
───────────────────────────────────────────────────────────── */

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

const STYLES = {
  success: 'bg-green-50  dark:bg-green-900/30  border-green-200 dark:border-green-700  text-green-800  dark:text-green-300',
  error:   'bg-red-50    dark:bg-red-900/30    border-red-200   dark:border-red-700    text-red-800    dark:text-red-300',
  warning: 'bg-amber-50  dark:bg-amber-900/30  border-amber-200 dark:border-amber-700  text-amber-800  dark:text-amber-300',
  info:    'bg-blue-50   dark:bg-blue-900/30   border-blue-200  dark:border-blue-700   text-blue-800   dark:text-blue-300',
};

const ICON_COLORS = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
};

let idCounter = 0;

// Individual Toast Item
const ToastItem = ({ id, type, message, onRemove }) => {
  const Icon = ICONS[type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 pr-3 rounded-xl border shadow-lg max-w-sm w-full
        animate-in slide-in-from-right-full duration-300
        ${STYLES[type]}
      `}
    >
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${ICON_COLORS[type]}`} />
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition shrink-0 ml-1"
      >
        <X className="w-3.5 h-3.5 opacity-60" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]); // max 5 at once
    timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, dur)  => addToast('success', msg, dur),
    error:   (msg, dur)  => addToast('error',   msg, dur || 6000),
    warning: (msg, dur)  => addToast('warning', msg, dur),
    info:    (msg, dur)  => addToast('info',    msg, dur),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — fixed top-right */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
