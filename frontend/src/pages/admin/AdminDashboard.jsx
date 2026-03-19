// ─── pages/admin/AdminDashboard.jsx ───────────────────────────────────────────
// Overview stats: total bookings, verified, pending, payment records
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, CheckCircle, Clock, XCircle, CreditCard, Unlock, Upload, Users, Settings2, RefreshCcw, QrCode, Scan } from 'lucide-react';
import api from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { icon: Users, label: 'Available Tickets', value: Math.max(0, 150 - stats.totalTickets), color: 'border-white text-white bg-white/5 shadow-2xl shadow-white/5' },
        { icon: Ticket, label: 'Tickets Issued', value: stats.totalTickets, color: 'border-white/10 text-white/60' },
        { icon: QrCode, label: 'Checked In', value: stats.scannedTickets, color: 'border-green-500/10 text-green-500' },
        { icon: Clock, label: 'Pending Bookings', value: stats.pending, color: 'border-white/5 text-white/40' },
        { icon: CreditCard, label: 'Payments', value: stats.totalPayments, color: 'border-white/5' },
        { icon: CheckCircle, label: 'Verified Bookings', value: stats.verified, color: 'border-white/5' },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">DASHBOARD</h1>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">REAL-TIME OVERVIEW</p>
        </div>
        <button onClick={() => api.get('/admin/stats').then((r) => setStats(r.data))} className="btn-secondary w-auto px-5 py-2.5 text-xs font-black uppercase tracking-widest gap-2">
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-white/40">
          <div className="spinner" /> Loading stats…
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div className="text-white/20 mb-4">
                <Icon size={28} strokeWidth={1.5} />
              </div>
              <div className="text-5xl font-black text-white mb-2 tracking-tighter tabular-nums">{value}</div>
              <div className="text-white/30 text-[9px] font-black uppercase tracking-[0.25em]">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { to: '/admin/scanner', icon: Scan, title: 'Live Scanner', desc: 'ATTENDANCE NODE' },
          { to: '/admin/payments', icon: Upload, title: 'Upload CSV', desc: 'PAYMENT SYNC' },
          { to: '/admin/bookings', icon: Users, title: 'Bookings', desc: 'VERIFICATION' },
          { to: '/admin/event', icon: Settings2, title: 'Event Config', desc: 'SYSTEM SETTINGS' },
        ].map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={to} className="card hover:bg-white/[0.04] p-10 group transition-all duration-500">
            <div className="text-white/20 group-hover:text-white transition-colors duration-500 mb-6">
              <Icon size={32} strokeWidth={1} />
            </div>
            <div>
              <p className="text-white font-black text-base tracking-tight mb-2 uppercase">{title}</p>
              <p className="text-white/20 group-hover:text-white/40 text-[9px] font-black tracking-[0.2em] transition-colors duration-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
