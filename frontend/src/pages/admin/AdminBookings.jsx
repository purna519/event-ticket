// ─── pages/admin/AdminBookings.jsx ────────────────────────────────────────────
// List all user bookings with ability to manually approve or reject
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Search, RefreshCcw, CheckCircle, Clock, XCircle, FileText, Check, X, Trash2, Edit2, MessageSquare } from 'lucide-react';
import api from '../../api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchBookings = () => {
    setLoading(true);
    api.get('/admin/bookings')
      .then((r) => setBookings(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchBookings, []);

  async function handleApprove(id) {
    setActionLoading(id + '-approve');
    try {
      await api.patch(`/admin/bookings/${id}/approve`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading('');
    }
  }

  async function handleReject(id) {
    const reason = window.prompt('Rejection reason (optional):') ?? 'Rejected by admin';
    setActionLoading(id + '-reject');
    try {
      await api.patch(`/admin/bookings/${id}/reject`, { reason });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading('');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this booking?')) return;
    setActionLoading(id + '-delete');
    try {
      await api.delete(`/admin/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    } finally {
      setActionLoading('');
    }
  }

  async function handleEdit(b) {
    const name = window.prompt('Full Name:', b.name) || b.name;
    const email = window.prompt('Email:', b.email) || b.email;
    const phone = window.prompt('Phone:', b.phone) || b.phone;
    const qty = window.prompt('Quantity:', b.quantity) || b.quantity;

    if (name === b.name && email === b.email && phone === b.phone && qty === b.quantity) return;

    setActionLoading(b._id + '-edit');
    try {
      await api.patch(`/admin/bookings/${b._id}`, { name, email, phone, quantity: qty });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    } finally {
      setActionLoading('');
    }
  }

  const filtered = bookings
    .filter((b) => filter === 'all' || b.status === filter)
    .filter(
      (b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.phone && b.phone.toLowerCase().includes(search.toLowerCase())) ||
        (b.email && b.email.toLowerCase().includes(search.toLowerCase())) ||
        b.utr.toLowerCase().includes(search.toLowerCase())
    );

  const badgeFor = (status) => {
    if (status === 'verified') return <span className="badge-verified"><CheckCircle size={10} strokeWidth={3} /> Verified</span>;
    if (status === 'pending') return <span className="badge-pending"><Clock size={10} strokeWidth={3} /> Pending</span>;
    return <span className="badge-rejected"><XCircle size={10} strokeWidth={3} /> Rejected</span>;
  };

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Bookings</h1>
        <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">MANAGEMENT AND VERIFICATION</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, or UTR..."
            className="input pl-11 py-3"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                filter === f
                  ? 'bg-white text-black shadow-lg shadow-white/5'
                  : 'bg-white/[0.03] text-white/30 hover:bg-white/5 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={fetchBookings} className="btn-secondary w-auto px-5 py-3 aspect-square !p-0">
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 bg-white/[0.01]">
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">{filtered.length} RECORDS FOUND</p>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 text-white/40 py-8 justify-center">
            <div className="spinner" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-white/30 text-center py-8 text-sm">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01]">
                  {['Name / Ticket', 'Qty', 'Contact Info', 'UTR', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="py-4 px-8 text-white/20 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b._id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group">
                    <td className="py-6 px-8">
                      <div className="text-white font-bold text-[13px] tracking-tight">{b.name}</div>
                      {b.status === 'verified' && b.tickets && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${b.tickets.filter(t => t.scanned).length === b.quantity ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/40'}`}>
                            {b.tickets.filter(t => t.scanned).length} / {b.quantity} SCANNED
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-6 px-8">
                       <div className="text-white font-black text-xs">x{b.quantity || 1}</div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="text-white/60 font-medium mb-1">{b.phone}</div>
                      <div className="text-white/30 text-[11px] font-medium">{b.email}</div>
                    </td>
                    <td className="py-6 px-8">
                      <span className="font-mono text-white/80 text-[11px] tracking-widest bg-white/[0.03] px-2 py-1 rounded-md">{b.utr}</span>
                    </td>
                    <td className="py-6 px-8">{badgeFor(b.status)}</td>
                    <td className="py-6 px-8 text-white/20 text-[11px] font-bold">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex gap-2">
                        {b.status !== 'verified' && (
                          <button
                            onClick={() => handleApprove(b._id)}
                            disabled={actionLoading === b._id + '-approve'}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
                            title="Approve"
                          >
                            {actionLoading === b._id + '-approve' ? '…' : <Check size={14} strokeWidth={3} />}
                          </button>
                        )}
                        {b.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(b._id)}
                            disabled={actionLoading === b._id + '-reject'}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50"
                            title="Reject"
                          >
                            {actionLoading === b._id + '-reject' ? '…' : <X size={14} strokeWidth={3} />}
                          </button>
                        )}
                        {b.status === 'verified' && (
                          <a
                            href={`/api/bookings/ticket/${b._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:bg-white hover:text-black transition-all duration-300"
                            title="Download PDF"
                          >
                            <FileText size={14} strokeWidth={2.5} />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(b)}
                          disabled={actionLoading === b._id + '-edit'}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
                          title="Edit Details"
                        >
                          {actionLoading === b._id + '-edit' ? '…' : <Edit2 size={13} strokeWidth={2.5} />}
                        </button>
                        {b.status === 'verified' && (
                          <button
                            onClick={() => handleWhatsAppSend(b)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300"
                            title="Send to WhatsApp"
                          >
                            <MessageSquare size={13} strokeWidth={2.5} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(b._id)}
                          disabled={actionLoading === b._id + '-delete'}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50"
                          title="Delete Booking"
                        >
                          {actionLoading === b._id + '-delete' ? '…' : <Trash2 size={13} strokeWidth={2.5} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
