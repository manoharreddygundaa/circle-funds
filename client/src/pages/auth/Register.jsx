import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, UserPlus, TrendingUp, CreditCard } from 'lucide-react';

const roleHome = {
  borrower: '/borrower/dashboard',
  lender: '/lender/dashboard',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'borrower',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Client-side validation before hitting the API
  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2)
      errs.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Enter a valid email address';
    if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    if (!/\d/.test(form.password))
      errs.password = 'Password must contain at least one number';
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(roleHome[user.role] || '/borrower/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
        Create your account
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Join Circle Funds as a borrower or lender
      </p>

      {/* Role Selector — visual toggle instead of a plain dropdown */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          {
            value: 'borrower',
            label: 'I want to Borrow',
            icon: CreditCard,
            desc: 'Apply for loans',
          },
          {
            value: 'lender',
            label: 'I want to Lend',
            icon: TrendingUp,
            desc: 'Fund loans & earn',
          },
        ].map(({ value, label, icon: Icon, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => setForm((p) => ({ ...p, role: value }))}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center
              ${
                form.role === value
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }
            `}
          >
            <Icon
              className={`w-6 h-6 ${
                form.role === value
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
            />
            <div>
              <p
                className={`text-sm font-semibold ${
                  form.role === value
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {label}
              </p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handle}
          placeholder="John Doe"
          error={errors.name}
          required
          autoComplete="name"
        />
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handle}
          placeholder="you@example.com"
          error={errors.email}
          required
          autoComplete="email"
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handle}
              placeholder="Min. 8 characters with a number"
              required
              autoComplete="new-password"
              className={`input-base pr-10 ${errors.password ? 'border-red-400' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}

          {/* Password strength indicator */}
          {form.password.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    form.password.length >= i * 3
                      ? i <= 1
                        ? 'bg-red-400'
                        : i <= 2
                        ? 'bg-yellow-400'
                        : i <= 3
                        ? 'bg-blue-400'
                        : 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Terms acknowledgement */}
        <p className="text-xs text-gray-400 text-center px-2">
          By creating an account you agree to our{' '}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>

        <Button type="submit" fullWidth loading={loading} size="lg">
          <UserPlus className="w-4 h-4" />
          Create Account
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
