// ─── pages/admin/AdminEvent.jsx ───────────────────────────────────────────────
// Edit event details including name, date, price, UPI config
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Info, CreditCard, Save, Users } from 'lucide-react';
import api from '../../api';

export default function AdminEvent() {
  const [form, setForm] = useState({
    name: '', date: '', time: '', venue: '', description: '', price: '', totalCapacity: '', upiId: '', upiName: '', upiNote: '',
    benefits: [], supportNumber: '', sponsors: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/events/current')
      .then((r) => setForm(r.data))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.put('/admin/event', form);
      setMsg('Event updated successfully');
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.error || 'Save failed'));
    } finally {
      setSaving(false);
    }
  }

  const addBenefit = () => {
    const b = window.prompt('Enter new benefit (e.g. Water Bottle):');
    if (b) setForm(p => ({ ...p, benefits: [...(p.benefits || []), b] }));
  };

  const removeBenefit = (index) => {
    setForm(p => ({ ...p, benefits: p.benefits.filter((_, i) => i !== index) }));
  };

  const addSponsor = async () => {
    const name = window.prompt('Enter Sponsor Name:');
    if (!name) return;

    // Create a hidden file input
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
        setMsg('Logo uploaded successfully');
      } catch (err) {
        setMsg('Upload failed: ' + (err.response?.data?.error || 'Server error'));
      } finally {
        setSaving(false);
      }
    };
    input.click();
  };

  const removeSponsor = (index) => {
    setForm(p => ({ ...p, sponsors: p.sponsors.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return <div className="flex items-center gap-3 text-white/40 py-8"><div className="spinner" />Loading event…</div>;
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Event Settings</h1>
        <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">SYSTEM CONFIGURATION</p>
      </div>

      <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6 pb-20">
        {/* Event Details */}
        <div className="card space-y-6">
          <h2 className="text-white font-black text-sm flex items-center gap-2 uppercase tracking-tight">
            <Info size={18} className="text-white/20" /> Event Info
          </h2>
          <div>
            <label className="input-label">Event Name</label>
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Tech Fest 2026"
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Date</label>
            <input
              type="date"
              value={form.date || ''}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Time</label>
            <input
              type="text"
              value={form.time || ''}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              placeholder="10:00 AM"
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Venue</label>
            <input
              type="text"
              value={form.venue || ''}
              onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
              placeholder="City Convention Centre"
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Google Maps Link</label>
            <input
              type="text"
              value={form.locationUrl || ''}
              onChange={(e) => setForm((p) => ({ ...p, locationUrl: e.target.value }))}
              placeholder="https://maps.google.com/..."
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief event description…"
              rows={3}
              className="input resize-none"
            />
          </div>
          <div>
            <label className="input-label">Ticket Price (₹)</label>
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="499"
              className="input"
            />
          </div>
          <div>
            <label className="input-label">Event Capacity (Total Tickets)</label>
            <input
              type="number"
              value={form.totalCapacity || ''}
              onChange={(e) => setForm((p) => ({ ...p, totalCapacity: e.target.value }))}
              placeholder="150"
              className="input"
            />
          </div>
        </div>

        {/* Configuration Column */}
        <div className="space-y-6">
          {/* UPI Configuration */}
          <div className="card space-y-6">
            <h2 className="text-white font-black text-sm flex items-center gap-2 uppercase tracking-tight">
              <CreditCard size={18} className="text-white/20" /> UPI Config
            </h2>
            <div>
              <label className="input-label">UPI ID (VPA)</label>
              <input
                type="text"
                value={form.upiId || ''}
                onChange={(e) => setForm((p) => ({ ...p, upiId: e.target.value }))}
                placeholder="yourname@upi"
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Payee Name</label>
              <input
                type="text"
                value={form.upiName || ''}
                onChange={(e) => setForm((p) => ({ ...p, upiName: e.target.value }))}
                placeholder="Tech Fest 2026"
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Transaction Note</label>
              <input
                type="text"
                value={form.upiNote || ''}
                onChange={(e) => setForm((p) => ({ ...p, upiNote: e.target.value }))}
                placeholder="TechFestTicket"
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Support / WhatsApp Number</label>
              <input
                type="text"
                value={form.supportNumber || ''}
                onChange={(e) => setForm((p) => ({ ...p, supportNumber: e.target.value }))}
                placeholder="7093237728"
                className="input"
              />
            </div>
          </div>

          {/* Benefits Management */}
          <div className="card space-y-6">
            <h2 className="text-white font-black text-sm flex items-center gap-2 uppercase tracking-tight">
              <Info size={18} className="text-white/20" /> Event Benefits
            </h2>
            <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
              These will be shown on the event page and printed on the tickets.
            </p>
            <div className="space-y-3">
              {(form.benefits || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                  <span className="text-xs text-white/60 font-medium">{b}</span>
                  <button 
                    type="button"
                    onClick={() => removeBenefit(i)}
                    className="text-white/20 hover:text-red-500 transition-colors"
                  >
                    X
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addBenefit}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/20 hover:border-white/20 hover:text-white/40 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                + Add Benefit
              </button>
            </div>
          </div>

          {/* Sponsors Management */}
          <div className="card space-y-6">
            <h2 className="text-white font-black text-sm flex items-center gap-2 uppercase tracking-tight">
              <Users size={18} className="text-white/20" /> Event Sponsors
            </h2>
            <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
              Logos will be displayed on the event page and tickets.
            </p>
            <div className="space-y-4">
              {(form.sponsors || []).map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 group">
                  <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0">
                    <img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-bold truncate tracking-tight">{s.name}</p>
                    <p className="text-[9px] text-white/20 truncate font-mono">{s.logoUrl}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeSponsor(i)}
                    className="text-white/20 hover:text-red-500 transition-colors p-2"
                  >
                    X
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addSponsor}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/20 hover:border-white/20 hover:text-white/40 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                + Add Sponsor
              </button>
            </div>
          </div>

          {msg && (
            <div className={`p-5 rounded-2xl text-[11px] font-bold uppercase tracking-widest ${msg.includes('success') ? 'bg-white/5 text-white border border-white/10' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {msg}
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary py-4 text-xs font-black uppercase tracking-[0.2em] gap-3">
            {saving ? <div className="spinner" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
