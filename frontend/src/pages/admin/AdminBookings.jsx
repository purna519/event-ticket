import { useEffect, useState, useRef } from 'react';
import { 
  Search, RefreshCcw, CheckCircle, Clock, XCircle, FileText, 
  Check, X, Trash2, Edit2, MessageSquare, Plus,
  User, Mail, Phone, Hash, ShieldCheck, ArrowRight, Save
} from 'lucide-react';
import api from '../../api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', email: '', phone: '', quantity: 1 });
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', quantity: 1 });
  const revealRef = useRef(null);

  const activeEventId = localStorage.getItem('activeEventId');

  const fetchBookings = () => {
    setLoading(true);
    // Filter by event if activeEventId exists
    api.get(`/admin/bookings${activeEventId ? `?eventId=${activeEventId}` : ''}`)
      .then((r) => setBookings(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [activeEventId]);

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

  function handleEdit(booking) {
    setIsEditing(booking._id);
    setEditForm({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      quantity: booking.quantity
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    setActionLoading(isEditing + '-edit');
    try {
      await api.patch(`/admin/bookings/${isEditing}`, editForm);
      setIsEditing(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    } finally {
      setActionLoading('');
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    setActionLoading('manual');
    try {
      await api.post('/admin/bookings/manual', manualForm);
      setShowManualModal(false);
      setManualForm({ name: '', email: '', phone: '', quantity: 1 });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to issue ticket');
    } finally {
      setActionLoading('');
    }
  }

  const filtered = bookings
    .filter((b) => filter === 'all' || b.status === filter)
    .filter(
      (b) =>
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.toLowerCase().includes(search.toLowerCase()) ||
        b.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.utr?.toLowerCase().includes(search.toLowerCase())
    );

  const statusBadge = (status) => {
    const styles = {
      verified: 'bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20',
      pending: 'bg-[#7a6e5c]/10 text-[#7a6e5c] border-[#7a6e5c]/20',
      rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
      initiated: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    return (
      <span className={`text-[9px] font-bold uppercase tracking-[2px] px-3 py-1.5 border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-12 animate-hero-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3 font-bold flex items-center gap-3">
             <ShieldCheck size={14} /> Registry node
          </div>
          <h1 className="font-playfair text-[clamp(42px,4vw,64px)] font-black leading-[0.9] tracking-[-2px] text-white">
            Society<br /><em className="text-[#c9a84c] not-italic italic">Bookings</em>
          </h1>
        </div>
        <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setShowManualModal(true)}
              className="btn-gold flex items-center gap-3"
            >
              <Plus size={16} /> Box Office Sale
            </button>
            <button 
              onClick={fetchBookings}
              className="w-12 h-12 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-all"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Registry (Name, UTR, Phone)..."
                className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
              />
          </div>
          <div className="flex bg-[#c9a84c]/[0.02] border border-[#c9a84c]/10 p-1">
             {['all', 'pending', 'verified', 'initiated', 'rejected'].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-[2px] transition-all ${
                   filter === f ? 'bg-[#c9a84c] text-[#070503]' : 'text-[#7a6e5c] hover:text-[#c9a84c]'
                 }`}
               >
                 {f}
               </button>
             ))}
          </div>
      </div>

      {/* Bookings List */}
      <div className="card-premium !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#c9a84c]/10">
                <th className="p-4 text-[10px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Holder</th>
                <th className="p-4 text-[10px] uppercase tracking-[2px] text-[#7a6e5c] font-bold text-center">Qty</th>
                <th className="p-4 text-[10px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">UTR / Source</th>
                <th className="p-4 text-[10px] uppercase tracking-[2px] text-[#7a6e5c] font-bold text-center">Date</th>
                <th className="p-4 text-[10px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Status</th>
                <th className="p-4 text-[10px] uppercase tracking-[2px] text-[#7a6e5c] font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c9a84c]/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full mb-4" />
                    <p className="text-[10px] tracking-[3px] uppercase text-[#7a6e5c]">Querying encrypted archives...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-[#7a6e5c] text-[11px] uppercase tracking-[3px]">
                    No records matched the criteria
                  </td>
                </tr>
              ) : filtered.map(b => (
                <tr key={b._id} className="group hover:bg-[#c9a84c]/[0.02] transition-colors">
                  <td className="p-4 py-6">
                    <div className="font-playfair text-white text-base font-bold group-hover:text-[#c9a84c] transition-colors leading-tight">{b.name}</div>
                    <div className="text-[9px] text-[#7a6e5c] uppercase tracking-widest mt-0.5 opacity-60">{b.email}</div>
                    <div className="text-[9px] text-[#7a6e5c] uppercase tracking-widest opacity-60">{b.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="inline-flex items-center justify-center w-8 h-8 border border-[#c9a84c]/20 text-white font-playfair font-black italic">
                      {b.quantity}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                       <div className="font-mono text-[9px] text-[#c9a84c] tracking-widest bg-[#c9a84c]/5 px-2 py-0.5 border border-[#c9a84c]/10 rounded inline-block w-fit">
                         {b.utr || 'N/A'}
                       </div>
                       <div className="text-[7px] uppercase tracking-widest text-[#7a6e5c] font-bold ml-1">
                          Source: <span className="text-white/60">{b.source || 'Direct'}</span>
                       </div>
                    </div>
                  </td>
                  <td className="p-4 text-center text-[10px] text-[#7a6e5c] font-mono whitespace-nowrap">
                     {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">{statusBadge(b.status)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                       <div className="flex gap-2">
                        {b.status !== 'verified' && (
                          <button 
                            onClick={() => handleApprove(b._id)} 
                            className="w-8 h-8 bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)]" 
                            title="Approve (Correct record or undo rejection)"
                          >
                             {actionLoading === b._id + '-approve' ? <RefreshCcw size={12} className="animate-spin" /> : <Check size={14} />}
                          </button>
                        )}
                        {b.status !== 'rejected' && (
                          <button 
                            onClick={() => handleReject(b._id)} 
                            className="w-8 h-8 bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                            title="REJECT (Correct record or undo approval)"
                          >
                             {actionLoading === b._id + '-reject' ? <RefreshCcw size={12} className="animate-spin" /> : <X size={14} />}
                          </button>
                        )}
                       </div>
                      
                      <button 
                        onClick={() => handleEdit(b)} 
                        className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all" 
                        title="Edit Metadata"
                      >
                         <Edit2 size={12} />
                      </button>

                      {b.status === 'verified' && (
                        <a 
                          href={`/api/bookings/ticket/${b._id}`} 
                          target="_blank" 
                          className="w-8 h-8 bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-all" 
                          title="Download Entry Pass"
                        >
                          <FileText size={12} />
                        </a>
                      )}

                      <button 
                        onClick={() => handleDelete(b._id)} 
                        className="w-8 h-8 border border-red-500/10 flex items-center justify-center text-red-500/40 hover:bg-red-500 hover:text-white transition-all" 
                        title="Delete Permanently"
                      >
                         {actionLoading === b._id + '-delete' ? <RefreshCcw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Issuance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-[#070503]/90 backdrop-blur-xl" onClick={() => setShowManualModal(false)} />
           <div className="relative w-full max-w-xl bg-[#070503] border border-[#c9a84c]/20 p-10 md:p-14 animate-hero-in">
              <h2 className="font-playfair text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Box Office<br /><em className="not-italic text-[#c9a84c]">Issuance</em></h2>
              <p className="text-[10px] tracking-[4px] uppercase text-[#7a6e5c] mb-10">Direct verified pass generation</p>

              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Holder Name</label>
                    <input 
                      required
                      className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                      value={manualForm.name}
                      onChange={e => setManualForm({...manualForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Pass Quantity</label>
                    <input 
                      type="number" minimum="1" required
                      className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                      value={manualForm.quantity}
                      onChange={e => setManualForm({...manualForm, quantity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Email Address</label>
                  <input 
                    type="email" required
                    className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                    value={manualForm.email}
                    onChange={e => setManualForm({...manualForm, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Phone Number</label>
                  <input 
                    required
                    className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                    value={manualForm.phone}
                    onChange={e => setManualForm({...manualForm, phone: e.target.value})}
                  />
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowManualModal(false)} className="flex-1 border border-[#c9a84c]/10 text-[#7a6e5c] py-5 uppercase text-[11px] font-bold tracking-[3px] hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading === 'manual'} className="flex-1 btn-gold py-5 flex items-center justify-center gap-3">
                    {actionLoading === 'manual' ? 'Issuing...' : <>Issue Pass <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
      {/* Edit Booking Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-[#070503]/90 backdrop-blur-xl" onClick={() => setIsEditing(null)} />
           <div className="relative w-full max-w-xl bg-[#070503] border border-[#c9a84c]/20 p-10 md:p-14 animate-hero-in">
              <h2 className="font-playfair text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Edit<br /><em className="not-italic text-[#c9a84c]">Reservation</em></h2>
              <p className="text-[10px] tracking-[4px] uppercase text-[#7a6e5c] mb-10">Updating existing guest metadata</p>

              <form onSubmit={saveEdit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Holder Name</label>
                    <input 
                      required
                      className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Pass Quantity</label>
                    <input 
                      type="number" minimum="1" required
                      className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                      value={editForm.quantity}
                      onChange={e => setEditForm({...editForm, quantity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Email Address</label>
                    <input 
                        type="email" required
                        className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                        value={editForm.email}
                        onChange={e => setEditForm({...editForm, email: e.target.value})}
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Phone Number</label>
                    <input 
                        required
                        className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                        value={editForm.phone}
                        onChange={e => setEditForm({...editForm, phone: e.target.value})}
                    />
                    </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsEditing(null)} className="flex-1 border border-[#c9a84c]/10 text-[#7a6e5c] py-5 uppercase text-[11px] font-bold tracking-[3px] hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading.includes('-edit')} className="flex-1 btn-gold py-5 flex items-center justify-center gap-3">
                    {actionLoading.includes('-edit') ? 'Saving...' : <>Update Record <Save size={16} /></>}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
