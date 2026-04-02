import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    dob: '',
    ageGroup: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/auth/profile');
      const user = res.data;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'male',
        dob: user.dob ? user.dob.split('T')[0] : '', // format for date input
        ageGroup: user.ageGroup || ''
      });
    } catch (err) {
      setMessage({ text: 'Failed to load profile data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      // Only send updatable fields
      const { phone, gender, dob, ageGroup } = formData;
      await api.put('/user/auth/profile', { phone, gender, dob, ageGroup });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070503] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070503] pt-[120px] pb-24 px-6 md:px-[60px]">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#7a6e5c] hover:text-[#c9a84c] mb-10 transition-colors uppercase tracking-[2px] text-[10px] font-bold"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="mb-12">
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3">Identity Management</div>
          <h1 className="font-playfair text-[clamp(38px,5vw,58px)] font-black leading-[1] text-white">
            Account <em className="text-[#c9a84c] not-italic italic">Profile</em>
          </h1>
          <p className="text-[14px] text-[#7a6e5c] mt-4">Update your legacy member information to unlock the full platform experience.</p>
        </div>

        {message.text && (
          <div className={`p-4 mb-8 text-[12px] uppercase tracking-[1px] font-bold border ${message.type === 'success' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#c9a84c]/[0.02] border border-[#c9a84c]/10 p-8 md:p-12 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Read Only Fields */}
            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#7a6e5c] mb-2 font-bold">Full Name</label>
              <input 
                type="text" 
                value={formData.name} 
                disabled 
                className="w-full bg-black/50 border border-white/5 p-4 text-white/50 focus:outline-none cursor-not-allowed text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#7a6e5c] mb-2 font-bold">Registered Email</label>
              <input 
                type="text" 
                value={formData.email} 
                disabled 
                className="w-full bg-black/50 border border-white/5 p-4 text-white/50 focus:outline-none cursor-not-allowed text-[14px]"
              />
            </div>

            {/* Editable Fields */}
            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#c9a84c] mb-2 font-bold">Phone Number *</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange}
                required
                className="w-full bg-white/[0.03] border border-[#c9a84c]/20 p-4 text-white focus:outline-none focus:border-[#c9a84c] transition-colors text-[14px]"
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#c9a84c] mb-2 font-bold">Gender *</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                required
                className="w-full bg-[#0a0805] border border-[#c9a84c]/20 p-4 text-white focus:outline-none focus:border-[#c9a84c] transition-colors text-[14px] appearance-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#c9a84c] mb-2 font-bold">Date of Birth</label>
              <input 
                type="date" 
                name="dob"
                value={formData.dob} 
                onChange={handleChange}
                className="w-full bg-[#0a0805] border border-[#c9a84c]/20 p-[14px] text-white focus:outline-none focus:border-[#c9a84c] transition-colors text-[14px]"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#c9a84c] mb-2 font-bold">Age Group</label>
              <select 
                name="ageGroup" 
                value={formData.ageGroup} 
                onChange={handleChange}
                className="w-full bg-[#0a0805] border border-[#c9a84c]/20 p-4 text-white focus:outline-none focus:border-[#c9a84c] transition-colors text-[14px] appearance-none"
              >
                <option value="">Select Age Group...</option>
                <option value="18-24">18-24 years</option>
                <option value="25-34">25-34 years</option>
                <option value="35-44">35-44 years</option>
                <option value="45+">45+ years</option>
              </select>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-[10px] tracking-[2px] uppercase text-[#7a6e5c]">
              <ShieldCheck size={14} className="text-[#c9a84c]" /> Secure Transmission
            </div>
            
            <button 
              type="submit" 
              disabled={saving}
              className="btn-gold !py-4 px-10 flex items-center gap-3 w-full md:w-auto justify-center"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {saving ? 'Synchronizing...' : 'Save Identity Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
