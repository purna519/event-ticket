import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/user/auth/login', { email, password });
      localStorage.setItem('userToken', res.data.token);
      localStorage.setItem('userData', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      if (err.response?.status === 43) {
        // Not verified
        navigate(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 anim-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 animate-pulse">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Welcome Back</h1>
          <p className="text-zinc-500 text-sm tracking-wide uppercase font-bold">Sign in to access your tickets</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Password</label>
              <Link to="/reset-password" name="forgot-password" id="forgot-password" className="text-[10px] text-zinc-500 hover:text-white transition-colors font-black uppercase tracking-widest">Forgot?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input
                type="password"
                required
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-500 text-xs font-bold text-center uppercase tracking-tight">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-tighter"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Sign In <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
          Don't have an account?{' '}
          <Link to="/register" name="sign-up" id="sign-up" className="text-white hover:underline transition-all">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
