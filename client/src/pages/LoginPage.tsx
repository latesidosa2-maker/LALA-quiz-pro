import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * LALA Quiz Pro - Secure Login & Onboarding
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stream, setStream] = useState<'Natural Science' | 'Social Science'>('Natural Science');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await authService.login(email, password);
      } else {
        await authService.register(name, email, password, stream);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue/20 mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            {mode === 'login' ? 'Secure Access' : 'Create Your Account'}
          </h1>
          <p className="text-on-surface-variant">
            {mode === 'login' ? 'Enter your credentials to continue your journey' : 'Start your exam prep journey'}
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error text-error text-sm font-bold rounded-2xl p-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-blue transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Abebe Kebede"
                  className="w-full bg-surface border border-outline rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-blue transition-colors"
                size={20}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@lalaquiz.pro"
                className="w-full bg-surface border border-outline rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-blue transition-colors"
                size={20}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-outline rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue focus:border-transparent outline-none transition-all"
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">
                Stream
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Natural Science', 'Social Science'] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setStream(s)}
                    className={`py-3 rounded-2xl border font-bold text-sm transition-all ${
                      stream === s
                        ? 'bg-blue border-blue text-white'
                        : 'bg-surface border-outline text-on-surface-variant'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" className="text-xs font-bold text-blue hover:text-blue-light transition-colors">
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue hover:bg-blue-dark text-white rounded-2xl font-black text-lg shadow-lg shadow-blue/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-4 text-on-surface-variant font-bold">
              {mode === 'login' ? 'New Student?' : 'Already have an account?'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full py-4 bg-surface border border-outline hover:border-blue/50 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
        >
          <User size={20} className="text-blue" />
          {mode === 'login' ? 'Create Free Account' : 'Log In Instead'}
        </button>
      </motion.div>
    </div>
  );
};

export default LoginPage;
