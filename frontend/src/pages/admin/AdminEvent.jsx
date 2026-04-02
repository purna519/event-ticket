import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Info, CreditCard, Save, Users, ShieldCheck, 
  MapPin, Calendar, Clock, DollarSign, Award, 
  Globe, Phone, Star, Trash2, Plus, RefreshCcw,
  Eye, Archive, CheckCircle, AlertTriangle, Play, Images
} from 'lucide-react';
import api from '../../api';

export default function AdminEvent() {
  const [form, setForm] = useState({
    name: '', date: '', time: '', venue: '', description: '', price: '', totalCapacity: '', upiId: '', upiName: '', upiNote: '',
    benefits: [], supportNumber: '', sponsors: [], imageUrl: '', videoUrl: '', media: [], status: 'Active', isArchived: false, displayUntil: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeEventId = queryParams.get('eventId') || localStorage.getItem('activeEventId');
  const isNewMode = queryParams.get('new') === 'true';

  useEffect(() => {
    if (activeEventId && !isNewMode) {
      setLoading(true);
      api.get(`/events/${activeEventId}`)
        .then((r) => {
          // Merge with initial state to avoid undefined values (fixes uncontrolled input warnings)
          setForm(prev => ({
            ...prev,
            ...r.data,
            imageUrl: r.data.imageUrl || '',
            videoUrl: r.data.videoUrl || '',
            media: r.data.media || [],
            locationUrl: r.data.locationUrl || ''
          }));
        })
        .catch(err => setMsg('Error loading event context'))
        .finally(() => setLoading(false));
    } else if (isNewMode) {
      setForm({
        name: '', date: '', time: '', venue: '', description: '', price: '', totalCapacity: '', upiId: '', upiName: '', upiNote: '',
        benefits: [], supportNumber: '', sponsors: [], imageUrl: '', videoUrl: '', media: [], status: 'Active', isArchived: false, displayUntil: ''
      });
      setLoading(false);
    }
  }, [activeEventId, isNewMode]);

  async function handleDelete() {
    if (!activeEventId) return;
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    setSaving(true);
    try {
      await api.delete(`/admin/events/${activeEventId}`);
      setMsg('Event Permanently Deleted');
      localStorage.removeItem('activeEventId');
      setTimeout(() => window.location.href = '/admin/studio', 1500);
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.error || 'Delete failed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      if (isNewMode) {
        const { data } = await api.post('/admin/events', form);
        setMsg('Event Created Successfully');
        localStorage.setItem('activeEventId', data.event._id);
        setTimeout(() => window.location.href = `/admin/event?eventId=${data.event._id}`, 1500);
      } else {
        if (!activeEventId) return setMsg('Error: No active event context identified');
        await api.put(`/admin/events/${activeEventId}`, form);
        setMsg('Configuration Synchronized Successfully');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.error || 'Sync failed'));
    } finally {
      setSaving(false);
    }
  }

  const addBenefit = () => {
    const b = window.prompt('Enter new benefit (e.g. VIP Access):');
    if (b) setForm(p => ({ ...p, benefits: [...(p.benefits || []), b] }));
  };

  const removeBenefit = (index) => {
    setForm(p => ({ ...p, benefits: p.benefits.filter((_, i) => i !== index) }));
  };

  const addSponsor = async () => {
    const name = window.prompt('Enter Sponsor Designation:');
    if (!name) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        setSaving(true);
        const { data } = await api.post('/admin/sponsors/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setForm(p => ({ ...p, sponsors: [...(p.sponsors || []), { name, logoUrl: data.logoUrl }] }));
        setMsg('Visual Asset Uploaded Successfully');
      } catch (err) {
        setMsg('Upload failed: ' + (err.response?.data?.error || 'Server error'));
      } finally {
        setSaving(false);
        setTimeout(() => setMsg(''), 3000);
      }
    };
    input.click();
  };

  const uploadMedia = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'video' ? 'video/*' : 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        setSaving(true);
        const { data } = await api.post('/admin/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (type === 'video') {
           setForm(p => ({ 
             ...p, 
             videoUrl: data.url,
             media: [...(p.media || []), { url: data.url, type: 'video', role: p.media?.length === 0 ? 'hero_video' : 'gallery' }]
           }));
        } else {
           setForm(p => ({ 
             ...p, 
             imageUrl: data.url,
             media: [...(p.media || []), { url: data.url, type: 'image', role: p.media?.length === 0 ? 'cover' : 'gallery' }]
           }));
        }
        setMsg('Production Asset Uploaded');
      } catch (err) {
        setMsg('Upload failed: ' + (err.response?.data?.error || 'Server error'));
      } finally {
        setSaving(false);
        setTimeout(() => setMsg(''), 3000);
      }
    };
    input.click();
  };

  const removeSponsor = (index) => {
    setForm(p => ({ ...p, sponsors: p.sponsors.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="w-12 h-12 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full" />
        <p className="text-[10px] tracking-[4px] uppercase text-[#7a6e5c]">Accessing System Parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-hero-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3 font-bold flex items-center gap-3">
             <ShieldCheck size={14} /> Master Control
          </div>
          <h1 className="font-playfair text-[clamp(42px,4vw,64px)] font-black leading-[0.9] tracking-[-2px] text-white">
            Event<br /><em className="text-[#c9a84c] not-italic italic">Configuration</em>
          </h1>
        </div>
        <div className="flex gap-4">
            {!isNewMode && activeEventId && (
              <button 
                onClick={handleDelete}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest"
              >
                <Trash2 size={16} /> Delete Event
              </button>
            )}
            <button 
              onClick={() => handleSave()}
              className="btn-gold flex items-center gap-3"
            >
              {saving ? <RefreshCcw className="animate-spin" size={16} /> : <><Save size={16} /> {isNewMode ? 'Create Event' : 'Deploy Settings'}</>}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Primary Details */}
        <div className="lg:col-span-2 space-y-8">
            <div className="card-premium !p-8 md:!p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                    <Info size={20} />
                  </div>
                  <div>
                    <h2 className="font-playfair text-xl font-bold text-white uppercase italic tracking-tight">Core Repository</h2>
                    <p className="text-[9px] tracking-[2px] uppercase text-[#7a6e5c]">Official Event Metadata</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Event Nomenclature</label>
                        <input
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-playfair text-xl italic font-black outline-none focus:border-[#c9a84c]"
                          value={form.name}
                          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                        />
                    </div>
                   
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold flex items-center gap-2"><Calendar size={12} /> Registry Date</label>
                        <input
                          type="date"
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                          value={form.date}
                          onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold flex items-center gap-2"><Clock size={12} /> Temporal Duration</label>
                        <input
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                          value={form.time}
                          placeholder="e.g. 10:00 AM - 1:00 PM"
                          onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold flex items-center gap-2"><MapPin size={12} /> Geographic Venue</label>
                        <input
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                          value={form.venue}
                          onChange={(e) => setForm(p => ({ ...p, venue: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold flex items-center gap-2"><Globe size={12} /> Navigational URL (Maps)</label>
                        <input
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-mono text-[11px] outline-none focus:border-[#c9a84c]"
                          value={form.locationUrl}
                          placeholder="https://maps.google.com/..."
                          onChange={(e) => setForm(p => ({ ...p, locationUrl: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Conceptual Narrative</label>
                        <textarea
                          rows={4}
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] resize-none"
                          value={form.description}
                          onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold flex items-center gap-2"><DollarSign size={12} /> Admission Price (₹)</label>
                        <input
                          type="number"
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                          value={form.price}
                          onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold flex items-center gap-2"><Users size={12} /> Capacity Threshold</label>
                        <input
                          type="number"
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                          value={form.totalCapacity}
                          onChange={(e) => setForm(p => ({ ...p, totalCapacity: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Payment Configuration */}
            <div className="card-premium !p-8 md:!p-10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="font-playfair text-xl font-bold text-white uppercase italic tracking-tight">Fiscal Pipeline</h2>
                    <p className="text-[9px] tracking-[2px] uppercase text-[#7a6e5c]">UPI Transaction Parameters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">UPI VPA Identity</label>
                        <input
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-mono text-[14px] outline-none focus:border-[#c9a84c]"
                          value={form.upiId}
                          onChange={(e) => setForm(p => ({ ...p, upiId: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Recipient Name</label>
                        <input
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                          value={form.upiName}
                          onChange={(e) => setForm(p => ({ ...p, upiName: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Transaction Ledger Note</label>
                        <input
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                          value={form.upiNote}
                          onChange={(e) => setForm(p => ({ ...p, upiNote: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold flex items-center gap-2"><Phone size={12} /> Contact Node</label>
                        <input
                          className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c]"
                          value={form.supportNumber}
                          onChange={(e) => setForm(p => ({ ...p, supportNumber: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Media Studio */}
            <div className="card-premium !p-8 md:!p-10 space-y-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                      <Images size={20} />
                    </div>
                    <div>
                      <h2 className="font-playfair text-xl font-bold text-white uppercase italic tracking-tight">Production Studio</h2>
                      <p className="text-[9px] tracking-[2px] uppercase text-[#7a6e5c]">Multi-Asset Visual Library</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => uploadMedia('image')} className="btn-gold !py-2 !px-4 text-[9px]">Add Photo</button>
                    <button onClick={() => uploadMedia('video')} className="btn-gold !py-2 !px-4 text-[9px]">Add Video</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {form.media && form.media.map((item, midx) => (
                       <div key={midx} className="relative group aspect-square bg-black/20 border border-white/5 overflow-hidden rounded-lg">
                          {item.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-[#c9a84c]/5">
                                <Play size={24} className="text-[#c9a84c]/40" />
                            </div>
                          ) : (
                            <img src={item.url.startsWith('http') ? item.url : `http://localhost:5000${item.url}`} className="w-full h-full object-cover" alt="Gallery item" />
                          )}
                          
                          <div className={`absolute top-2 left-2 px-2 py-0.5 text-[7px] font-bold uppercase tracking-wider rounded ${
                            item.role === 'cover' ? 'bg-[#c9a84c] text-black' : 
                            item.role === 'hero_video' ? 'bg-blue-500 text-white' : 
                            item.role === 'hero_image' ? 'bg-purple-500 text-white' : 'bg-black/60 text-white/60'
                          }`}>
                            {item.role}
                          </div>

                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-4">
                             <select 
                               className="w-full bg-white/10 border border-white/10 text-[8px] uppercase tracking-widest p-1 outline-none text-white"
                               value={item.role}
                               onChange={(e) => {
                                  const newRole = e.target.value;
                                  // Map and ensure only ONE of these unique roles exists
                                  const newMedia = form.media.map((m, i) => {
                                     let role = m.role;
                                     if (i === midx) role = newRole;
                                     else if (newRole !== 'gallery' && m.role === newRole) role = 'gallery';
                                     return { ...m, role };
                                  });
                                  
                                  const poster = newMedia.find(m => m.role === 'cover' && m.type === 'image');
                                  const videoPromo = newMedia.find(m => m.role === 'hero_video' && m.type === 'video');

                                  setForm(p => ({ 
                                     ...p, 
                                     media: newMedia,
                                     imageUrl: poster ? poster.url : p.imageUrl,
                                     videoUrl: videoPromo ? videoPromo.url : p.videoUrl
                                  }));
                               }}
                             >
                                <option value="gallery">Event Gallery (Atmosphere)</option>
                                <option value="cover">Event Poster (Main Thumbnail)</option>
                                {item.type === 'video' && <option value="hero_video">Home Page Promotion (Video)</option>}
                                {item.type === 'image' && <option value="hero_image">Home Page Promotion (Background Image)</option>}
                             </select>
                             <button 
                               onClick={() => setForm(p => ({...p, media: p.media.filter((_, i) => i !== midx)}))}
                               className="w-full py-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 text-[8px] uppercase tracking-widest font-bold"
                             >
                               Delete
                             </button>
                          </div>
                       </div>
                    ))}
                    {(!form.media || form.media.length === 0) && (
                      <div className="col-span-full py-12 border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center text-[#7a6e5c] gap-3">
                         <div className="w-12 h-12 rounded-full bg-white/[0.02] flex items-center justify-center">
                            <Plus size={20} />
                         </div>
                         <p className="text-[10px] uppercase tracking-[3px]">No Visual Assets Hosted</p>
                      </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Status and Lists */}
        <div className="space-y-8">
             {/* Status Control */}
             <div className="card-premium !p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                    <RefreshCcw size={20} />
                  </div>
                  <div>
                    <h2 className="font-playfair text-xl font-bold text-white uppercase italic tracking-tight">System Status</h2>
                    <p className="text-[9px] tracking-[2px] uppercase text-[#7a6e5c]">Presence & Visibility</p>
                  </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Event Lifecycle State</label>
                        <div className="flex flex-col gap-2">
                            {['Active', 'Sold Out', 'Completed'].map(s => (
                                <button
                                    key={s} type="button"
                                    onClick={() => setForm(p => ({ ...p, status: s }))}
                                    className={`p-4 text-[10px] font-bold uppercase tracking-[3px] border transition-all text-left flex items-center justify-between ${
                                        form.status === s ? 'bg-[#c9a84c]/10 border-[#c9a84c] text-[#c9a84c]' : 'bg-[#c9a84c]/5 border-[#c9a84c]/10 text-[#7a6e5c] hover:border-[#c9a84c]/30'
                                    }`}
                                >
                                    {s}
                                    {form.status === s && <CheckCircle size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#c9a84c]/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white text-[12px] font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Archive size={14} className={form.isArchived ? 'text-[#c9a84c]' : 'text-[#7a6e5c]'} /> 
                                    Archival Status
                                </h3>
                                <p className="text-[9px] text-[#7a6e5c] uppercase mt-1">Hide from public registry</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, isArchived: !p.isArchived }))}
                                className={`w-14 h-7 rounded-full border p-1 transition-all ${
                                    form.isArchived ? 'bg-[#c9a84c]/20 border-[#c9a84c]' : 'bg-black border-[#7a6e5c]/20'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full transition-all ${
                                    form.isArchived ? 'bg-[#c9a84c] translate-x-7' : 'bg-[#7a6e5c]/40 translate-x-0'
                                }`} />
                            </button>
                        </div>
                    </div>
                </div>
             </div>

             {/* Benefits */}
             <div className="card-premium !p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                            <Award size={18} />
                        </div>
                        <h2 className="font-playfair text-lg font-bold text-white uppercase italic tracking-tight">Privileges</h2>
                    </div>
                    <button type="button" onClick={addBenefit} className="w-8 h-8 flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c]/5 p-1 border border-[#c9a84c]/15">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="space-y-2">
                    {form.benefits?.map((b, i) => (
                        <div key={i} className="group flex items-center justify-between p-4 bg-[#c9a84c]/5 border border-[#c9a84c]/10">
                            <span className="text-[11px] text-white/80 font-bold uppercase tracking-wider">{b}</span>
                            <button type="button" onClick={() => removeBenefit(i)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:scale-110 transition-all">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
             </div>

             {/* Sponsors */}
             <div className="card-premium !p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                            <Star size={18} />
                        </div>
                        <h2 className="font-playfair text-lg font-bold text-white uppercase italic tracking-tight">Patrons</h2>
                    </div>
                    <button type="button" onClick={addSponsor} className="w-8 h-8 flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c]/5 p-1 border border-[#c9a84c]/15">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="space-y-4">
                    {form.sponsors?.map((s, i) => (
                        <div key={i} className="group flex items-center gap-4 p-3 bg-[#c9a84c]/5 border border-[#c9a84c]/10">
                            <div className="w-12 h-12 bg-white/10 overflow-hidden flex items-center justify-center border border-[#c9a84c]/20">
                                <img src={s.logoUrl} alt={s.name} className="max-w-full max-h-full object-contain p-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-white font-black uppercase tracking-widest truncate">{s.name}</p>
                            </div>
                            <button type="button" onClick={() => removeSponsor(i)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:scale-110 transition-all p-2">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
             </div>
        </div>
      </div>

      {/* Message Overlay */}
      {msg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
            <div className={`p-6 border flex items-center gap-4 backdrop-blur-xl ${
                msg.toLowerCase().includes('success') || msg.toLowerCase().includes('synchronized') 
                ? 'bg-[#c9a84c]/10 border-[#c9a84c] text-[#c9a84c]' 
                : 'bg-red-500/10 border-red-500 text-red-500'
            }`}>
                {msg.toLowerCase().includes('error') ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                <span className="text-[11px] font-bold uppercase tracking-[3px]">{msg}</span>
            </div>
        </div>
      )}
    </div>
  );
}
