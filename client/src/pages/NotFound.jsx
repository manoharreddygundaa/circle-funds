import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ArrowLeft, Search } from 'lucide-react';

const ROLE_HOME = {
  borrower: '/borrower/dashboard',
  lender:   '/lender/dashboard',
  admin:    '/admin/dashboard',
};

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const home = user ? ROLE_HOME[user.role] : '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">

        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
              <Search className="w-9 h-9 text-gray-300" />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">CF</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Circle Funds</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate(home)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            {user ? 'Go to Dashboard' : 'Go to Login'}
          </button>
        </div>

        {/* Decorative dots */}
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-300 dark:bg-blue-700"
              style={{ opacity: 0.3 + i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
