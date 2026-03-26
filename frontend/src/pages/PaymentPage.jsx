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
  const [phase, setPhase] = useState(1);

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

  const [msg, setMsg] = useState('');

  const handlePaymentDone = async () => {
    setSubmitting(true);
    setMsg('');
    try {
      await api.post('/bookings/initiate', { quantity });
      navigate('/history');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to initiate booking');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = event ? event.price * quantity : 0;
  
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
          <StepIndicator current={phase === 1 ? 1 : 2} />
        </div>

        {/* Main Content */}
        <div className="space-y-10">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block w-8 h-[1px] bg-gradient-to-r from-yellow-500/50 to-transparent" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500/60">
                {phase === 1 ? 'Phase I: Reservation' : 'Phase II: Settlement'}
              </p>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-[0.85] mb-4">
              {phase === 1 ? (
                <>Pass<br /><span className="text-white/40">Selection</span></>
              ) : (
                <>Final<br /><span className="text-white/40">Settlement</span></>
              )}
            </h1>
          </div>

          {phase === 1 ? (
            <div className="space-y-12">
              {/* Pricing Card */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-white/5 to-transparent rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative card !p-10 bg-black/60 border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden backdrop-blur-xl">
                  {/* Availability Warning */}
                  {event && quantity > (event.totalCapacity - event.reservedTickets) && (
                    <div className="absolute inset-0 bg-red-500/10 backdrop-blur-md flex items-center justify-center p-8 z-10 text-center border border-red-500/20">
                      <div>
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Capacity Alert</p>
                        <p className="text-white text-sm font-bold uppercase tracking-tight">
                          Only {Math.max(0, event.totalCapacity - event.reservedTickets)} Tickets Remaining
                        </p>
                        <p className="text-white/40 text-[9px] mt-2 uppercase font-black tracking-widest underline cursor-pointer" onClick={() => setQuantity(Math.max(1, event.totalCapacity - event.reservedTickets))}>
                          Adjust to max available
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-[9px] font-black text-yellow-500/40 uppercase tracking-[0.3em] mb-2">Total Amount</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-light text-white/30">₹</span>
                      <p className="text-6xl font-black text-white tracking-tighter lowercase">{totalAmount}<span className="text-2xl text-white/20">.00</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-3">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-4">Tickets</p>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="bg-black text-white font-black text-base px-8 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-yellow-500/50 transition-all cursor-pointer hover:bg-white/5"
                    >
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (event && quantity > (event.totalCapacity - event.reservedTickets)) return;
                  setPhase(2);
                }}
                disabled={event && quantity > (event.totalCapacity - event.reservedTickets)}
                className={`w-full relative group overflow-hidden rounded-[2.5rem] ${event && quantity > (event.totalCapacity - event.reservedTickets) ? 'opacity-20 cursor-not-allowed' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-400 group-hover:scale-105 transition-transform duration-500" />
                <div className="relative py-7 px-10 text-[11px] font-black uppercase tracking-[0.5em] text-black text-center font-bold">
                  PROCEED TO PAYMENT
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Instructions */}
              <div className="space-y-6 text-center">
                {isMobile ? (
                  <div className="p-8 rounded-[2.5rem] bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-yellow-500 text-sm font-black uppercase tracking-tight italic">
                      Mobile User detected
                    </p>
                    <p className="text-white/60 text-[11px] mt-2 font-bold uppercase tracking-widest leading-relaxed">
                      please take a screen shot and make payment<br />
                      and then click the below button
                    </p>
                  </div>
                ) : (
                  <div className="p-8 rounded-[2.5rem] bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-yellow-500 text-sm font-black uppercase tracking-tight italic">
                      Desktop users detected
                    </p>
                    <p className="text-white/60 text-[11px] mt-2 font-bold uppercase tracking-widest leading-relaxed">
                      please scan qr code and make paymnet<br />
                      and click on the below button
                    </p>
                  </div>
                )}
              </div>

              {/* QR Section */}
              <div className="flex justify-center">
                <div className="relative group p-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-[3rem]">
                  <div className="relative bg-black rounded-[2.9rem] p-10 text-center">
                    <div className="relative p-6 bg-white rounded-3xl mx-auto inline-block">
                      <img src={paymentQr} alt="Payment QR" className="w-56 h-56" />
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-2">
                       <p className="text-white/40 text-[10px] uppercase font-black tracking-widest italic">AMOUNT TO PAY:</p>
                       <span className="text-xl font-black text-white italic tracking-tighter">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="space-y-6">
                <button
                  disabled={submitting}
                  onClick={handlePaymentDone}
                  className="w-full relative group overflow-hidden rounded-[2.5rem]"
                >
                  <div className="absolute inset-0 bg-white group-hover:bg-zinc-200 transition-colors" />
                  <div className="relative py-7 px-10 text-[11px] font-black uppercase tracking-[0.3em] text-black text-center font-bold">
                    {submitting ? 'PROCESSING...' : 'Click here after payment is completed'}
                  </div>
                </button>

                {msg && (
                  <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                    {msg}
                  </div>
                )}

                <button
                  onClick={() => setPhase(1)}
                  className="w-full py-4 text-[9px] font-black text-white/20 uppercase tracking-[0.5em] hover:text-white/40 transition-all italic"
                >
                  Change Ticket Quantity
                </button>
              </div>
            </div>
          )}

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
