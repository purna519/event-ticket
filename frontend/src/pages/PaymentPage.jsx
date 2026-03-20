// ─── pages/PaymentPage.jsx ──────────────────────────────────────────────────
// Instructions for UPI payment with deep links and unified layout.
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Smartphone, Info, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, Sparkles, Phone, CheckSquare, Square } from 'lucide-react';
import axios from 'axios';
import api from '../api';
import StepIndicator from '../components/StepIndicator';
import PublicLayout from '../components/PublicLayout';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(location.state?.quantity || 1);
  const [paymentQr, setPaymentQr] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    api.get('/events/current').then((res) => {
      setEvent(res.data);
      setLoading(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (event) {
      api.get(`/bookings/payment-qr?amount=${event.price * quantity}`)
        .then(res => setPaymentQr(res.data.qr));
    }
  }, [event, quantity]);

  const handlePaymentDone = async () => {
    setSubmitting(true);
    try {
      await api.post('/bookings/initiate', { quantity });
      navigate('/history');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initiate booking');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = event ? event.price * quantity : 0;
  
  // Generating a unique transaction reference to satisfy UPI security requirements
  const transactionId = `T${Date.now()}R${Math.floor(Math.random() * 1000)}`;
  const upiLink = event ? `upi://pay?pa=${event.upiId}&pn=${encodeURIComponent(event.upiName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(event.upiNote || 'Bhajan Entry')}&tr=${transactionId}&mc=0000` : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-10 h-10 border-[3px]" />
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="animate-slide-up">
        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator current={1} />
        </div>

        {/* Main Content */}
        <div className="space-y-10">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block w-8 h-[1px] bg-gradient-to-r from-yellow-500/50 to-transparent" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500/60">Royal Reserve Secure</p>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-4">
              Executive<br /><span className="text-white/40">Checkout</span>
            </h1>
          </div>

          {/* Pricing Banner - More Premium */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-white/5 to-transparent rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative card !p-10 bg-black/60 border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden backdrop-blur-xl">
              <div className="flex-1">
                <p className="text-[9px] font-black text-yellow-500/40 uppercase tracking-[0.3em] mb-2">PREMIUM SETTLEMENT</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-light text-white/30">₹</span>
                  <p className="text-6xl font-black text-white tracking-tighter lowercase">{totalAmount}<span className="text-2xl text-white/20">.00</span></p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-3">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-4">Passes</p>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-black text-white font-black text-base px-8 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-yellow-500/50 transition-all cursor-pointer hover:bg-white/5"
                >
                  {[...Array(4)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-yellow-500/40 flex-shrink-0">
                <Sparkles size={24} strokeWidth={1} />
              </div>
              {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            </div>
          </div>

          {/* Payment Instructions - Royal Redesign */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-2">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Scan to Pay</p>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="relative group p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-[4rem]">
              <div className="relative flex flex-col items-center bg-black/80 backdrop-blur-2xl rounded-[3.9rem] p-16 text-center overflow-hidden">
                {/* Background Aura */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-64 bg-yellow-500/10 blur-[100px] -translate-y-1/2" />
                
                <div className="relative group/qr mb-10">
                  <div className="absolute -inset-12 bg-white/10 rounded-full blur-[80px] opacity-0 group-hover/qr:opacity-100 transition-opacity duration-1000" />
                  <div className="relative p-8 bg-white rounded-[3rem] shadow-[0_0_80px_rgba(255,255,255,0.1)] transition-transform duration-700 hover:scale-[1.02]">
                    <img src={paymentQr} alt="Payment QR" className="w-64 h-64 opacity-90" />
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                      <p className="text-[9px] font-black text-black/50 uppercase tracking-[0.3em]">Royal Payment Node</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 max-w-sm relative">
                  <h3 className="text-white font-black text-2xl tracking-tighter uppercase leading-none italic">Scan to Settle</h3>
                  <p className="text-white/40 text-[11px] font-medium leading-relaxed uppercase tracking-tighter">
                    Open any UPI app and scan to transmit <span className="text-white font-black italic">₹{totalAmount}</span> into our secure vault.
                  </p>
                  <div className="pt-8 border-t border-white/10 flex items-center justify-center gap-6 text-white/20">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-yellow-500/50" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">Military-Grade Auth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">Upi Protocol 2.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Info - Premium Minimal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all">
                <div>
                  <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mb-1">SUPPORT CONCIERGE</p>
                  <p className="text-white font-black text-base tracking-tighter">{event.supportNumber || '7093237728'}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-yellow-500/60 transition-colors">
                  <Phone size={20} strokeWidth={1.5} />
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                  <Info size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mb-1">TRANSACTION PROTOCOL</p>
                  <p className="text-[10px] text-white/50 leading-tight font-bold uppercase tracking-tighter">
                    Verify settlement before final confirmation
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Declaration - Sleek Toggle */}
            <div
              onClick={() => setHasPaid(!hasPaid)}
              className={`relative overflow-hidden p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer flex items-center gap-6 group ${
                hasPaid 
                  ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.1)]' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                hasPaid 
                  ? 'bg-yellow-500 text-black shadow-lg' 
                  : 'bg-white/5 text-white/20 group-hover:bg-white/10 group-hover:text-white/40'
              }`}>
                {hasPaid ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-black uppercase tracking-tight transition-colors duration-500 ${hasPaid ? 'text-white' : 'text-white/30'}`}>
                  Settlement Confirmed
                </p>
                <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest group-hover:text-white/20 transition-colors">
                  I manifest that the funds have been dispatched
                </p>
              </div>
              {hasPaid && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-yellow-500/40 animate-pulse">
                  <Sparkles size={20} />
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 flex flex-col gap-6">
            <button
              disabled={submitting || !hasPaid}
              onClick={handlePaymentDone}
              className="relative group overflow-hidden rounded-[2.5rem]"
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 transition-transform duration-500 ${submitting || !hasPaid ? 'opacity-20 grayscale' : 'group-hover:scale-110'}`} />
              <div className={`relative btn-primary py-7 px-10 text-[11px] font-black uppercase tracking-[0.5em] border-none shadow-2xl transition-all ${submitting || !hasPaid ? 'opacity-50' : 'active:scale-[0.98]'}`}>
                {submitting ? 'VALIDATING REFERENCE...' : 'INITIATE TICKET ISSUANCE'}
              </div>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-3 text-white/20 hover:text-white/60 text-[9px] font-black uppercase tracking-[0.4em] transition-all py-2"
            >
              <div className="h-[1px] w-4 bg-white/10" />
              Return to Reserve
              <div className="h-[1px] w-4 bg-white/10" />
            </button>
          </div>

          <div className="pt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5">
              <ShieldCheck size={12} className="text-yellow-500/40" />
              <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.3em]">
                Verified Premium Gateway • Secured by HMS Protocol
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
