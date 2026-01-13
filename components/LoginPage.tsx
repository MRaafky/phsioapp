import React, { useState } from 'react';
import type { User } from '../types';

interface LoginPageProps {
  onUserAuth: (email: string, pass: string) => Promise<User | null>;
  onUserRegister: (name: string, email: string, pass: string) => Promise<{ success: boolean, message: string }>;
  onGuestLogin: () => void;
}

type AuthMode = 'login' | 'register';

const LoginPage: React.FC<LoginPageProps> = ({ onUserAuth, onUserRegister, onGuestLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // User state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        if (!userEmail || !userPassword) {
          setError('Email and password are required.');
          return;
        }
        const success = await onUserAuth(userEmail, userPassword);
        if (!success) {
          setError('Invalid credentials. Please check your email and password.');
        }
      } else { // Register
        if (!userName || !userEmail || !userPassword) {
          setError('All fields are required for registration.');
          return;
        }
        const result = await onUserRegister(userName, userEmail, userPassword);
        if (!result.success) {
          setError(result.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetFields = () => {
    setError('');
    setUserName('');
    setUserEmail('');
    setUserPassword('');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-50 p-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-100/40 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-white text-2xl mb-4 shadow-lg shadow-emerald-200">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2 font-heading">
              {authMode === 'login' ? 'Welcome Back' : 'Join Physio Connect'}
            </h2>
            <p className="text-slate-500">
              {authMode === 'login'
                ? 'Sign in to access your personalized therapy plan.'
                : 'Create an account to start your journey to recovery.'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex p-1 bg-slate-100/80 rounded-xl mb-8">
            <button
              onClick={() => { setAuthMode('login'); resetFields(); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${authMode === 'login'
                ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); resetFields(); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${authMode === 'register'
                ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUserSubmit} className="space-y-5">
            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all font-medium text-slate-700 placeholder-slate-400 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all font-medium text-slate-700 placeholder-slate-400 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="name@example.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                value={userPassword}
                onChange={e => setUserPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all font-medium text-slate-700 placeholder-slate-400 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2 border border-red-100">
                <i className="fas fa-exclamation-circle text-lg"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Processing...
                </span>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Guest Option */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm mb-4">Or continue without account</p>
            <button
              type="button"
              onClick={onGuestLogin}
              className="w-full py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-slate-400 text-xs">
            Are you a medical professional? <a href="/admin" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">Admin Portal</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;