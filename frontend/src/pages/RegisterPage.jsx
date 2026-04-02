import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus, User, Mail, Phone, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', gender: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.gender) return setError('Please select your gender');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.phone.length !== 10) return setError('Phone number must be 10 digits');
    
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
    <div className="min-h-screen bg-[#070503] flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md space-y-8 animate-hero-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#c9a84c]/5 border border-[#c9a84c]/20 mb-4">
            <UserPlus className="w-8 h-8 text-[#c9a84c]" />
          </div>
          <h1 className="font-playfair text-4xl font-black text-white tracking-tighter uppercase">Join the<br /><em className="text-[#c9a84c] not-italic italic">Society</em></h1>
          <p className="text-[#7a6e5c] text-[10px] tracking-[3px] uppercase font-bold">Create your member profile</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
              <input
                type="text"
                required
                className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                placeholder="you@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Gender</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
                <select
                  required
                  className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all appearance-none"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="" disabled className="bg-[#070503]">Select Gender</option>
                  <option value="male" className="bg-[#070503]">Male</option>
                  <option value="female" className="bg-[#070503]">Female</option>
                  <option value="other" className="bg-[#070503]">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
             </div>
             <div className="space-y-2">
               <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Confirm</label>
                <input
                  type="password"
                  required
                  className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                Create Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[#7a6e5c] text-[10px] tracking-[2.5px] uppercase font-bold">
          Already a member?{' '}
          <Link to="/login" className="text-[#c9a84c] hover:underline transition-all">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
