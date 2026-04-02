import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldCheck, Loader2, ArrowRight, User } from 'lucide-react';
import api from '../../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070503] flex items-center justify-center p-6 selection:bg-[#c9a84c]/30">
      <div className="w-full max-w-md space-y-10 animate-hero-in">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#c9a84c]/5 border border-[#c9a84c]/20 mb-2">
            <ShieldCheck className="w-8 h-8 text-[#c9a84c]" />
          </div>
          <div>
            <h1 className="font-playfair text-4xl font-black text-white tracking-tighter uppercase leading-none">
              Command<br /><em className="text-[#c9a84c] not-italic italic">Center</em>
            </h1>
            <p className="text-[#7a6e5c] text-[10px] tracking-[4px] uppercase font-bold mt-4">Identity Verification Required</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="card-premium !p-8 md:!p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c] font-bold">Admin Identifier</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c] font-bold">Access Code</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 animate-shake">
                <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold flex items-center justify-center gap-3 !py-5 shadow-[0_15px_35px_rgba(201,168,76,0.15)] group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Establish Connection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-[#7a6e5c] hover:text-[#c9a84c] text-[10px] font-bold uppercase tracking-[3px] transition-all duration-300 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Sanctuary
          </Link>
        </div>
      </div>
    </div>
  );
}
