import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RiskScoreBar } from '../components/shared/RiskScoreBar';
import { Sun, Moon, User, Lock, Bell, Shield } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="card space-y-4">
    <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </div>
);

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [profileMsg, setProfileMsg]   = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileErr, setProfileErr]   = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass]       = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim() || profile.name.length < 2) {
      setProfileErr('Name must be at least 2 characters');
      return;
    }
    setSavingProfile(true);
    setProfileErr('');
    try {
      const res = await api.patch('/auth/update-profile', profile);
      updateUser(res.data.user);
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPasswordErr('New passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordErr('New password must be at least 8 characters');
      return;
    }
    setSavingPass(true);
    setPasswordErr('');
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordMsg('Password changed successfully!');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordErr(err.response?.data?.message || 'Password change failed');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Account Summary */}
      <div className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-blue-100 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>
        {user?.creditScore && (
          <div className="mt-4">
            <RiskScoreBar score={user.creditScore} showLabel={false} />
            <p className="text-xs text-blue-100 mt-1">Credit Score: {user.creditScore}</p>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <Section icon={User} title="Profile Information">
        <form onSubmit={saveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            error={profileErr}
          />
          <Input
            label="Phone Number"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+91 XXXXX XXXXX"
          />
          <Input label="Email Address" value={user?.email || ''} disabled className="opacity-60 cursor-not-allowed" />
          <p className="text-xs text-gray-400">Email cannot be changed once registered.</p>

          {profileMsg && (
            <p className="text-sm text-green-600 dark:text-green-400">✅ {profileMsg}</p>
          )}
          <Button type="submit" variant="primary" loading={savingProfile}>
            Save Profile
          </Button>
        </form>
      </Section>

      {/* Password Section */}
      <Section icon={Lock} title="Change Password">
        <form onSubmit={changePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            placeholder="Your current password"
          />
          <Input
            label="New Password"
            type="password"
            value={passwords.new}
            onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
            placeholder="At least 8 characters with a number"
            error={passwordErr}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
            placeholder="Repeat new password"
          />
          {passwordMsg && (
            <p className="text-sm text-green-600 dark:text-green-400">✅ {passwordMsg}</p>
          )}
          <Button type="submit" variant="primary" loading={savingPass}>
            Change Password
          </Button>
        </form>
      </Section>

      {/* Appearance Section */}
      <Section icon={Sun} title="Appearance">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-xs text-gray-400">Currently using {isDark ? 'dark' : 'light'} theme</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none
              ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
              ${isDark ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>
      </Section>

      {/* Security Info */}
      <Section icon={Shield} title="Security">
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Sessions are secured with JWT — tokens expire automatically
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Passwords are hashed with bcrypt (cost factor 12)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            All API calls are rate-limited to prevent abuse
          </div>
        </div>
      </Section>
    </div>
  );
}
