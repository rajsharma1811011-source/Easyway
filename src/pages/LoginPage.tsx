import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, UserCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('EasyWay@2026');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-default shadow-lg">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#323232] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Compass className="w-6 h-6 text-[#DDD0C8]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#323232]">
            Welcome Back
          </h2>
          <p className="text-xs text-[#555555] mt-1">
            Sign in to access your planned trips, favorites, and recommendations
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#323232] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#323232] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#323232] hover:bg-black text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In to EasyWay'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Accounts for Seamless Testing */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center mb-3">
            Quick Demo Accounts (Pre-seeded)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('traveler@easyway.in')}
              className="p-2 rounded-xl border border-default hover:bg-[#DDD0C8]/25 text-[11px] font-semibold text-[#323232] flex flex-col items-center gap-1 transition-colors"
            >
              <User className="w-4 h-4 text-[#555555]" />
              <span>Traveler</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('vikram@easyway.in')}
              className="p-2 rounded-xl border border-default hover:bg-[#DDD0C8]/25 text-[11px] font-semibold text-[#323232] flex flex-col items-center gap-1 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#555555]" />
              <span>Guide</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@easyway.in')}
              className="p-2 rounded-xl border border-default hover:bg-[#DDD0C8]/25 text-[11px] font-semibold text-[#323232] flex flex-col items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#555555]" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-[#555555]">
          Don't have an EasyWay account?{' '}
          <Link to="/register" className="font-bold text-[#323232] underline">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
};
