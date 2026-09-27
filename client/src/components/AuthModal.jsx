import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Sparkles, LogIn, UserPlus, ArrowRight, ShieldCheck, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [serverError, setServerError] = useState('');
  const { login, register: registerUser, demoLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (mode === 'login') {
        await login(data.email, data.password);
      } else {
        await registerUser(data.name, data.email, data.password, 'traveler');
      }
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setServerError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleDemoClick = async (role) => {
    setServerError('');
    try {
      await demoLogin(role);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setServerError(err.message || 'Failed demo sign in');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-md bg-bone-light rounded-3xl p-6 sm:p-8 border border-bone-border shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-bone hover:bg-bone-border text-ink-muted hover:text-ink flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-navy text-marigold flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-navy">Itinera</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-1">
          {mode === 'login' ? 'Traveler Sign In' : 'Join Itinera'}
        </h2>
        <p className="text-sm text-ink-muted mb-6">
          {mode === 'login'
            ? 'Access your customized holiday packages and live quotes.'
            : 'Design tailor-made trips with instant DIY hotel and activity swaps.'}
        </p>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-bone rounded-xl mb-6 border border-bone-border">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setServerError('');
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-navy shadow-xs border border-bone-border'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setServerError('');
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white text-navy shadow-xs border border-bone-border'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Samantha Reed"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-bone-border focus:border-navy focus:ring-1 focus:ring-navy outline-none text-ink text-sm transition-all"
              />
              {errors.name && <p className="text-xs text-marigold-700 mt-1">{errors.name.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@domain.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
              })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-bone-border focus:border-navy focus:ring-1 focus:ring-navy outline-none text-ink text-sm transition-all"
            />
            {errors.email && <p className="text-xs text-marigold-700 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-bone-border focus:border-navy focus:ring-1 focus:ring-navy outline-none text-ink text-sm transition-all"
            />
            {errors.password && <p className="text-xs text-marigold-700 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-navy text-bone font-semibold text-sm hover:bg-navy-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              'Authenticating...'
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Itinera' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Accounts Pre-filled for Testing */}
        <div className="mt-6 pt-5 border-t border-bone-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
            <Sparkles className="w-3.5 h-3.5 text-marigold" />
            <span>Instant Demo Sign In</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoClick('traveler')}
              className="p-3 rounded-xl bg-bone hover:bg-bone-border/70 border border-bone-border text-left transition-all group"
            >
              <div className="text-xs font-bold text-navy group-hover:text-marigold-700">Samantha Reed</div>
              <div className="text-[11px] text-ink-muted">Traveler Role</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="p-3 rounded-xl bg-bone hover:bg-bone-border/70 border border-bone-border text-left transition-all group"
            >
              <div className="text-xs font-bold text-navy group-hover:text-marigold-700">Curator Admin</div>
              <div className="text-[11px] text-ink-muted">Admin Role</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
