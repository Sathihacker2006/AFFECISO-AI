import React, { useState } from 'react';
import { Shield, Sparkles, X, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api.ts';
import { User } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(email, password, displayName);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'user' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@affecio.safety' : 'demo@affecio.safety';
      const demoPass = role === 'admin' ? 'AdminShield2026!' : 'TrustAi2026!';
      const res = await api.login(demoEmail, demoPass);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#070b14] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,242,254,0.15)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-3 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {isRegister ? 'Create Safety Account' : 'Access Trust Command Center'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isRegister
              ? 'Join AFFECIO TRUSTAI to protect your dating interactions'
              : 'Secure authentication with end-to-end user isolation'}
          </p>
        </div>

        {/* Judge Fast-Evaluation shortcuts */}
        <div className="mb-6 bg-[#0b132b]/80 border border-cyan-500/20 rounded-xl p-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hackathon Judge Quick Access:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              disabled={loading}
              className="py-1.5 px-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[11px] font-medium flex items-center justify-center space-x-1 cursor-pointer transition-all"
            >
              <span>👤 User Demo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="py-1.5 px-2.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-300 text-[11px] font-medium flex items-center justify-center space-x-1 cursor-pointer transition-all"
            >
              <span>🛡️ Admin Radar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Jordan Morgan"
                  className="w-full bg-[#0b132b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0b132b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Password {isRegister && <span className="text-gray-500">(min 8 characters)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b132b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-[#070b14] font-semibold text-xs tracking-wide shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-gray-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            {isRegister
              ? 'Already have an account? Sign in here'
              : "Don't have an account yet? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
