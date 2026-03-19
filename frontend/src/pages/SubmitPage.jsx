// ─── pages/SubmitPage.jsx ─────────────────────────────────────────────────────
// Form for user to submit their details and UTR with unified layout.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, Mail, Hash, Search, ArrowLeft, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import api from '../api';
import StepIndicator from '../components/StepIndicator';
import PublicLayout from '../components/PublicLayout';

export default function SubmitPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    utr: '', 
    quantity: location.state?.quantity || 1 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(''); 
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const utr = form.utr.trim().toUpperCase();
    if (!/^[A-Za-z0-9]{10,22}$/.test(utr)) {
      return setError('UTR must be 10-22 alphanumeric characters');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/bookings/submit', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        utr,
        quantity: parseInt(form.quantity) || 1,
      });
      navigate(`/status/${data.bookingId}`, {
        state: { status: data.status, ticketId: data.ticketId },
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Submission failed. Please try again.';
      if (err.response?.data?.bookingId) {
        navigate(`/status/${err.response.data.bookingId}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <div className="animate-slide-up">
        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator current={2} />
        </div>

        {/* Main Content */}
        <div className="space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block w-8 h-[1px] bg-white/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Identity Check</p>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.95] mb-4">
              Booking<br />Verification
            </h1>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-4">
               256-bit encrypted validation protocol
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="card !p-10 space-y-8 bg-black/20 border-white/5">
              <div className="grid md:grid-cols-1 gap-8">
                {/* Full Name */}
                <div className="relative group">
                  <label className="input-label-premium">
                    <User size={12} className="inline mr-2 text-white/10" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="ENTER FULL NAME"
                    required
                    minLength={2}
                    className="input-premium"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Phone */}
                  <div className="relative group">
                    <label className="input-label-premium">
                      <Phone size={12} className="inline mr-2 text-white/10" /> Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91"
                      required
                      className="input-premium"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <label className="input-label-premium">
                      <Mail size={12} className="inline mr-2 text-white/10" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="YOU@EXAMPLE.COM"
                      required
                      className="input-premium"
                    />
                  </div>
                </div>

                {/* UTR / Transaction ID */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="relative group">
                    <label className="input-label-premium">
                      <Hash size={12} className="inline mr-2 text-white/10" /> Transaction ID (UTR)
                    </label>
                    <input
                      type="text"
                      name="utr"
                      value={form.utr}
                      onChange={handleChange}
                      placeholder="12-DIGIT TRANSACTION CODE"
                      required
                      className="input-premium font-mono tracking-[0.2em]"
                      maxLength={22}
                      autoComplete="off"
                      autoCapitalize="characters"
                    />
                  </div>

                  <div className="relative group">
                    <label className="input-label-premium">
                      <Ticket size={12} className="inline mr-2 text-white/10" /> Quantity
                    </label>
                    <select
                      name="quantity"
                      value={form.quantity || 1}
                      onChange={handleChange}
                      className="input-premium appearance-none cursor-pointer"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i+1} value={i+1} className="bg-neutral-900 leading-relaxed font-bold py-2">{i+1} TICKET{i+1 > 1 ? 'S' : ''}</option>
                      ))}
                    </select>
                    {location.state?.quantity && (
                      <p className="absolute -bottom-5 left-0 text-[8px] font-black text-white/20 uppercase tracking-widest">Matches your payment</p>
                    )}
                    <div className="absolute right-6 top-[3.25rem] pointer-events-none text-white/20">
                      <Sparkles size={14} />
                    </div>
                  </div>
                </div>

                <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                  <ShieldCheck size={10} /> Must match payment confirmation
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-4 p-6 rounded-[1.5rem] bg-red-500/5 border border-red-500/10 animate-shake">
                <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
                <p className="text-red-500 text-[9px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary py-6 text-[10px] font-black uppercase tracking-[0.5em] group flex items-center justify-center gap-4">
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="spinner w-4 h-4 border-[2px]" />
                  Processing…
                </div>
              ) : (
                <>
                  <Search size={16} strokeWidth={3} /> Submit Verification
                </>
              )}
            </button>

            <button
               type="button"
               onClick={() => navigate('/pay', { state: location.state })}
               className="w-full flex items-center justify-center gap-2 text-white/20 hover:text-white/40 text-[9px] font-black uppercase tracking-[0.3em] py-2 transition-all"
            >
               <ArrowLeft size={12} /> Back to Payment
            </button>
          </form>

          <div className="flex items-center justify-center gap-3 text-[9px] font-black text-white/10 tracking-[0.2em] uppercase">
            <Sparkles size={12} /> Priority Validation Protocol Active
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
