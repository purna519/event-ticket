// ─── pages/admin/AdminLogin.jsx ───────────────────────────────────────────────
// Admin login form — stores JWT in localStorage on success
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 text-white mb-6 shadow-2xl">
            <Lock size={28} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter overflow-hidden">ADMIN<span className="text-white/30">PANEL</span></h1>
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-3">Identity Verification Required</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="input-label">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="admin"
              required
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              required
              className="input"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary py-3.5">
            {loading ? (
              <>
                <div className="spinner" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center mt-10">
          <a href="/" className="inline-flex items-center gap-2 text-white/20 hover:text-white/60 text-[11px] font-black uppercase tracking-widest transition-all duration-300">
            <ArrowLeft size={14} /> Back to Event
          </a>
        </p>
      </div>
    </div>
  );
}
