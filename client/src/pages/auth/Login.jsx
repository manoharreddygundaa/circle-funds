import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const roleHome = { borrower: '/borrower/dashboard', lender: '/lender/dashboard', admin: '/admin/dashboard' };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || '/borrower/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      borrower: { email: 'borrower@demo.com', password: 'Demo1234' },
      lender:   { email: 'lender@demo.com',   password: 'Demo1234' },
      admin:    { email: 'admin@demo.com',     password: 'Demo1234' },
    };
    setForm(demos[role]);
  };

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

      {/* Demo buttons */}
      <div className="flex gap-2 mb-6">
        {['borrower', 'lender', 'admin'].map(role => (
          <button
            key={role}
            type="button"
            onClick={() => fillDemo(role)}
            className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize transition"
          >
            {role}
          </button>
        ))}
      </div>
      <div className="relative mb-6">
        <hr className="border-gray-200 dark:border-gray-600" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white dark:bg-gray-800 px-3 text-xs text-gray-400">
          or enter credentials
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          name="email"
          value={form.email}
          onChange={handle}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handle}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="input-base pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          Create one
        </Link>
      </p>
    </>
  );
}
