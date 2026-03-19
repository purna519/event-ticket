import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus, User, Mail, Phone, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.phone.length !== 10) return setError('Phone number must be exactly 10 digits');
    
    setLoading(true);
    setError('');

    try {
      await api.post('/user/auth/register', form);
      navigate(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md space-y-8 anim-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Join Us</h1>
          <p className="text-zinc-500 text-sm tracking-wide uppercase font-bold">Create your account for "The Music Society"</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                required
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Phone (10 Digits)</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-black uppercase ml-1 tracking-widest">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input
                type="password"
                required
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:border-white/40 focus:bg-zinc-900 transition-all outline-none"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                Create Account <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
          Already have an account?{' '}
          <Link to="/login" name="sign-in-link" id="sign-in-link" className="text-white hover:underline transition-all">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
