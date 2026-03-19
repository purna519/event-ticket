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
  const upiLink = event ? `upi://pay?pa=${event.upiId}&pn=${encodeURIComponent(event.upiName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(event.upiNote || 'Bhajan Entry')}` : '';

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
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block w-8 h-[1px] bg-white/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Secure Settlement</p>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.95] mb-4">
              Complete<br />Payment
            </h1>
          </div>

          {/* Pricing Banner */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative card !p-8 bg-black/40 border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
              <div className="flex-1">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">TOTAL AMOUNT</p>
                <p className="text-4xl font-black text-white tracking-tighter">₹{totalAmount}.00</p>
              </div>

              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl p-2">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-4">Tickets</p>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-black text-white font-black text-sm px-6 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 transition-all cursor-pointer"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 flex-shrink-0">
                <CreditCard size={20} strokeWidth={1.5} />
              </div>
              {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 border border-white/10 rounded-lg bg-white/5 text-white/40"><Smartphone size={16} /></div>
              <div>
                <p className="text-[11px] font-bold text-white tracking-tight leading-snug">
                  {isMobile ? 'Quick Pay via UPI' : 'Scan to Pay / Enter UPI ID'}
                </p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mt-1">
                  {isMobile ? 'Tap the button below or scan with 3rd party app' : 'Scan the QR with your phone or copy the ID'}
                </p>
              </div>
            </div>

            {isMobile ? (
              <div className="space-y-4">
                <a
                  href={upiLink}
                  className="flex items-center justify-between p-6 rounded-[2rem] bg-white text-black hover:bg-white/90 transition-all group shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-6" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Pay via Google Pay</span>
                  </div>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href={upiLink}
                  className="flex items-center justify-between p-6 rounded-[2rem] bg-[#5f259f] text-white hover:bg-[#4d1e82] transition-all group shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <img src="https://vignette.wikia.nocookie.net/logopedia/images/e/e1/PhonePe_Logo.svg" alt="PhonePe" className="h-6 brightness-0 invert" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Pay via PhonePe</span>
                  </div>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Or scan with any UPI app</p>
                  <div className="mt-4 flex justify-center">
                    <div className="p-3 bg-white rounded-xl">
                      <img src={paymentQr} alt="QR" className="w-24 h-24" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 text-center">
                <div className="relative group/qr mb-8">
                  <div className="absolute -inset-8 bg-white/5 rounded-full blur-3xl opacity-50 group-hover/qr:opacity-100 transition-opacity" />
                  <div className="relative p-6 bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <img src={paymentQr} alt="Payment QR" className="w-56 h-56" />
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-black/10 animate-pulse" />
                      <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Live Payment Node</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-w-sm">
                  <h3 className="text-white font-black text-xl tracking-tight uppercase">Scan to Complete Payment</h3>
                  <p className="text-white/30 text-[11px] font-medium leading-relaxed">
                    Open GPay, PhonePe, or any UPI app on your phone and scan the code above to pay <span className="text-white">₹{event.price * quantity}</span>
                  </p>
                  <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-4 text-white/20">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Secure Checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card !p-6 bg-white/[0.01] border-white/5 flex items-center justify-between">
              <div>
                <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">Support Contact</p>
                <p className="text-white font-bold text-sm tracking-tight">{event.supportNumber || '7093237728'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                <Phone size={18} />
              </div>
            </div>

            <div className="card !p-6 bg-white/[0.01] border-white/5">
              <div className="flex items-start gap-4">
                <Info size={14} className="text-white/20 mt-1 flex-shrink-0" />
                <div className="space-y-3">
                  <p className="text-[11px] text-white/50 leading-relaxed font-medium uppercase tracking-tight">
                    After payment, tick the confirmation and click <span className="text-white font-bold">"Confirm Payment"</span>.
                    Your booking will be placed in <span className="text-white font-bold">Pending Status</span> until verified by our admin.
                  </p>
                  <div className="flex items-center gap-2 text-[9px] font-black text-white/20 tracking-wider uppercase">
                    <Sparkles size={10} /> Automated Confirmation Protocol
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Declaration Checkbox */}
            <div
              onClick={() => setHasPaid(!hasPaid)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 group ${hasPaid ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'
                }`}
            >
              <div className={`p-2 rounded-xl transition-all ${hasPaid ? 'bg-white text-black' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
                {hasPaid ? <CheckSquare size={18} /> : <Square size={18} />}
              </div>
              <div className="text-left">
                <p className={`text-xs font-black uppercase tracking-tight transition-colors ${hasPaid ? 'text-white' : 'text-white/30'}`}>
                  I have completed the payment
                </p>
                <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest group-hover:text-white/20 transition-colors">
                  I want my ticket and I've sent the funds
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <button
              disabled={submitting || !hasPaid}
              onClick={handlePaymentDone}
              className="btn-primary py-5 text-[10px] font-black uppercase tracking-[0.4em] disabled:opacity-20 disabled:grayscale transition-all"
            >
              {submitting ? 'Initiating...' : 'Grab Your Tickets By Clicking Here'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 text-white/20 hover:text-white/40 text-[9px] font-black uppercase tracking-[0.3em] transition-all"
            >
              <ArrowLeft size={12} /> Back to Event Details
            </button>
          </div>

          <p className="text-center flex items-center justify-center gap-2 text-[10px] text-white/10 font-black uppercase tracking-widest mt-8">
            <ShieldCheck size={12} /> Verified UPI Gateway Protocol
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
