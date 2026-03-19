import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Users, Search, Edit2, Trash2, Plus, X, Save, Loader2, Mail, Phone, User as UserIcon } from 'lucide-react';

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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            <Users className="w-8 h-8" /> User Directory
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage platform members</p>
        </div>
        
        <button 
          onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', phone: '', password: '' }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
        >
          <Plus className="w-3 h-3" /> Add New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
        <input 
          type="text"
          placeholder="Search by name, email or phone..."
          className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-white placeholder:text-zinc-600 focus:border-white/20 focus:bg-zinc-900 transition-all outline-none text-sm font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Verified</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <Loader2 className="w-6 h-6 text-zinc-700 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    No users found matching your search
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-6 font-bold text-white tracking-tight uppercase italic">{u.name}</td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold tracking-tight uppercase">
                          <Mail className="w-3 h-3 opacity-30" /> {u.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold tracking-tight uppercase">
                          <Phone className="w-3 h-3 opacity-30" /> {u.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${u.isVerified ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'}`}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(u)}
                          className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u._id)}
                          className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-all"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>

            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-8">
              {editingUser ? 'Edit Member' : 'New Member'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-white/30 transition-all outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      required
                      className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-white/30 transition-all outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="tel"
                      required
                      className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-white/30 transition-all outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Password {editingUser && '(Leave blank to keep)'}</label>
                <div className="relative group">
                  <Save className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="password"
                    required={!editingUser}
                    className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-white/30 transition-all outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Save className="w-4 h-4" /> {editingUser ? 'Update Member' : 'Save Member'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
