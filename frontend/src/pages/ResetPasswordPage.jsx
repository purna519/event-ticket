import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { KeyRound, Mail, ShieldCheck, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1); // 1: Request, 2: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/user/auth/reset-password-request', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/user/auth/reset-password', { email, otp, newPassword });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 anim-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Reset Password</h1>
          <p className="text-zinc-500 text-sm tracking-wide uppercase font-bold">
            {step === 1 ? 'Enter your email to receive a code' : 'Enter the code and new password'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-bold uppercase tracking-tight text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-tighter"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Code <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Reset Code</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-bold uppercase tracking-tight text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-tighter"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Update Password <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        )}

        <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
          Remember your password?{' '}
          <Link to="/login" className="text-white hover:underline transition-all">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
