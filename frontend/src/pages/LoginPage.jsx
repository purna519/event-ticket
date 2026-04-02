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
      window.location.reload();
    } catch (err) {
      if (err.response?.status === 403) {
        navigate(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070503] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-hero-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#c9a84c]/5 border border-[#c9a84c]/20 mb-4">
            <LogIn className="w-8 h-8 text-[#c9a84c]" />
          </div>
          <h1 className="font-playfair text-4xl font-black text-white tracking-tighter uppercase">Welcome<br /><em className="text-[#c9a84c] not-italic italic">Back</em></h1>
          <p className="text-[#7a6e5c] text-[10px] tracking-[3px] uppercase font-bold">Sign in to your society account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Password</label>
              <Link to="/reset-password" className="text-[9px] tracking-[2.5px] uppercase text-[#c9a84c] hover:underline">Forgot?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
              <input
                type="password"
                required
                className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-[11px] font-bold text-center uppercase tracking-tight">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[#7a6e5c] text-[10px] tracking-[2.5px] uppercase font-bold">
          New to the society?{' '}
          <Link to="/register" className="text-[#c9a84c] hover:underline transition-all">Register</Link>
        </p>
      </div>
    </div>
  );
}
