import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
  Users, Search, Edit2, Trash2, Plus, X, 
  Save, Loader2, Mail, Phone, User as UserIcon,
  ShieldCheck, Download, Filter, UserCheck, TrendingUp, ArrowRight
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const resp = await api.get(`/admin/users?search=${search}`);
      setUsers(resp.data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone, password: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, formData);
      } else {
        await api.post('/admin/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    window.open(`${api.defaults.baseURL}/admin/users/export`, '_blank');
  };

  // Simple Analytics
  const totalVerified = users.filter(u => u.isVerified).length;
  const newToday = users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-12 animate-hero-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3 font-bold flex items-center gap-3">
             <ShieldCheck size={14} /> Member Intelligence
          </div>
          <h1 className="font-playfair text-[clamp(42px,4vw,64px)] font-black leading-[0.9] tracking-[-2px] text-white">
            User<br /><em className="text-[#c9a84c] not-italic italic">Directory</em>
          </h1>
        </div>
        <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleExport}
              className="w-12 h-12 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-all"
              title="Export User Data"
            >
              <Download size={16} />
            </button>
            <button 
              onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', phone: '', password: '' }); setIsModalOpen(true); }}
              className="btn-gold flex items-center gap-3"
            >
              <Plus size={16} /> Enroll Member
            </button>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Members', val: users.length, icon: Users },
          { label: 'Verified Status', val: totalVerified, icon: UserCheck },
          { label: 'New Discoveries', val: newToday, icon: TrendingUp },
        ].map((s, i) => (
          <div key={i} className="card-premium !p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] tracking-[2px] uppercase text-[#7a6e5c] font-bold">{s.label}</p>
              <p className="font-playfair text-3xl font-black text-white italic leading-none mt-1">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Member Archives..."
            className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-5 pl-14 text-white font-dm text-[15px] outline-none focus:border-[#c9a84c] transition-all"
          />
      </div>

      {/* Users List */}
      <div className="card-premium !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#c9a84c]/10">
                <th className="p-8 text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-bold">Identity</th>
                <th className="p-8 text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-bold">Encrypted Credentials</th>
                <th className="p-8 text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-bold">Verification</th>
                <th className="p-8 text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-bold text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c9a84c]/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full mb-4" />
                    <p className="text-[10px] tracking-[3px] uppercase text-[#7a6e5c]">Querying member vaults...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-[#7a6e5c] text-[11px] uppercase tracking-[3px]">
                    No members discovered
                  </td>
                </tr>
              ) : users.map(u => (
                <tr key={u._id} className="group hover:bg-[#c9a84c]/[0.02] transition-colors">
                  <td className="p-8">
                    <div className="font-playfair text-white text-lg font-bold group-hover:text-[#c9a84c] transition-colors">{u.name}</div>
                    <div className="flex gap-4 mt-1">
                       <span className="text-[10px] text-[#7a6e5c] uppercase flex items-center gap-1.5"><Mail size={10} /> {u.email}</span>
                       <span className="text-[10px] text-[#7a6e5c] uppercase flex items-center gap-1.5"><Phone size={10} /> {u.phone}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="group/pass relative font-mono text-[11px] text-[#c9a84c]/40 tracking-widest cursor-pointer hover:text-[#c9a84c] transition-colors flex items-center gap-2">
                       {u.supportPassword ? (
                         <>
                           <span>••••••••</span>
                           <div className="opacity-0 group-hover/pass:opacity-100 absolute -top-12 left-0 bg-[#070503] border border-[#c9a84c]/20 p-2 text-white font-dm text-[10px] whitespace-nowrap z-50 transition-all">
                             Archive Password: <span className="text-[#c9a84c] font-mono">{u.supportPassword}</span>
                           </div>
                         </>
                       ) : <span className="italic opacity-30">NOT_DCRYPTD</span>}
                    </div>
                  </td>
                  <td className="p-8">
                    <button 
                      onClick={async () => {
                        try {
                          await api.patch(`/admin/users/${u._id}/verify`, { isVerified: !u.isVerified });
                          fetchUsers();
                        } catch (err) { alert('Verification failed'); }
                      }}
                      className={`text-[9px] font-bold uppercase tracking-[2px] px-3 py-1.5 border transition-all ${
                        u.isVerified ? 'bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20' : 'bg-red-500/10 text-red-500/40 border-red-500/10'
                      }`}
                    >
                      {u.isVerified ? 'VERIFIED' : 'PENDING'}
                    </button>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(u)} className="w-10 h-10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#070503] transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(u._id)} className="w-10 h-10 border border-red-500/10 flex items-center justify-center text-red-500/30 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-[#070503]/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
           <div className="relative w-full max-w-xl bg-[#070503] border border-[#c9a84c]/20 p-10 md:p-14 animate-hero-in">
              <h2 className="font-playfair text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">
                {editingUser ? 'Amend' : 'Enroll'}<br /><em className="not-italic text-[#c9a84c]">Member</em>
              </h2>
              <p className="text-[10px] tracking-[4px] uppercase text-[#7a6e5c] mb-10">Archive Identity Modification</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Identity Full Name</label>
                  <input
                    required
                    className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Email Node</label>
                    <input
                      type="email" required
                      className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Registry Phone</label>
                    <input
                      type="tel" required
                      className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Access Code {editingUser && '(Leave Blank to Retain)'}</label>
                  <input
                    type="password"
                    required={!editingUser}
                    className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border border-[#c9a84c]/10 text-[#7a6e5c] py-5 uppercase text-[11px] font-bold tracking-[3px] hover:bg-white/5 transition-colors">
                    Discard
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 btn-gold py-5 flex items-center justify-center gap-3">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save Archive <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
