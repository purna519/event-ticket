import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Smartphone, Info, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, Sparkles, Phone, CheckSquare, Square, Ticket, Music } from 'lucide-react';
import api from '../api';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId: paramId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(location.state?.quantity || 1);
  const [paymentQr, setPaymentQr] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(null);
  const revealRefs = useRef([]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    const targetId = paramId || localStorage.getItem('activeEventId');
    if (!targetId) {
        navigate('/events');
        return;
    }

    api.get(`/events/${targetId}`).then((res) => {
      setEvent(res.data);
      setLoading(false);
    }).catch(() => {
        setLoading(false);
    });
  }, [navigate, paramId]);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [loading, phase]);

  useEffect(() => {
    if (event) {
      const url = `/bookings/payment-qr?eventId=${event._id}&amount=${event.price * quantity}`;
      api.get(url).then(res => {
         if (res.data.qr !== paymentQr) {
            setPaymentQr(res.data.qr);
         }
      });
    }
  }, [event, quantity, paymentQr]);

  const applyPromo = async () => {
    setApplyingPromo(true);
    setPromoError('');
    try {
       const { data } = await api.post('/bookings/promo/validate', { code: promoCode });
       setPromoDiscount({ type: data.discountType, value: data.discountValue });
    } catch (err) {
       setPromoError(err.response?.data?.error || 'Invalid promo code');
       setPromoDiscount(null);
    } finally {
       setApplyingPromo(false);
    }
  };

  const handlePaymentDone = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/bookings/initiate', { 
         eventId: event._id, 
         quantity,
         promoCode: promoDiscount ? promoCode : null
      });
      navigate('/history');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initiate booking');
    } finally {
      setSubmitting(false);
    }
  };

  const baseAmount = event ? event.price * quantity : 0;
  let totalAmount = baseAmount;
  if (promoDiscount) {
     if (promoDiscount.type === 'percent') {
        totalAmount = Math.max(0, baseAmount - (baseAmount * (promoDiscount.value / 100)));
     } else {
        totalAmount = Math.max(0, baseAmount - promoDiscount.value);
     }
  }
  
  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070503] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-[#070503] pt-[120px] pb-[100px] px-6 md:px-[60px]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div ref={addToRefs} className="reveal mb-16">
           <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3">
             Step {phase} of 3 — {phase === 1 ? 'Selection' : 'Payment'}
           </div>
           <h1 className="font-playfair text-[clamp(42px,5vw,72px)] font-black leading-[1] tracking-[-2px] text-white">
              {phase === 1 ? 'Order' : 'Final'}<br /><em className="text-[#c9a84c] not-italic italic">{phase === 1 ? 'Quantities' : 'Settlement'}</em>
           </h1>
        </div>

        {phase === 1 ? (
          <div className="space-y-12">
            <div ref={addToRefs} className="reveal bg-[#c9a84c]/[0.02] border border-[#c9a84c]/15 p-10 flex flex-col md:flex-row items-center justify-between gap-10">
               <div>
                  <div className="text-[10px] tracking-[3px] uppercase text-[#7a6e5c] mb-4">Total Society Pass Value</div>
                  <div className="flex items-baseline gap-2 text-white">
                     <span className="text-3xl font-light text-[#c9a84c]/40">₹</span>
                     <span className="text-7xl font-bold font-playfair">{totalAmount}</span>
                     <span className="text-2xl text-[#7a6e5c]">.00</span>
                  </div>
               </div>

               <div className="flex items-center gap-4 bg-[#c9a84c]/5 border border-[#c9a84c]/15 p-3">
                  <span className="text-[10px] tracking-[2px] uppercase text-[#7a6e5c] px-4 font-bold">Qty</span>
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="bg-[#070503] text-white font-bold p-4 border border-[#c9a84c]/10 focus:border-[#c9a84c] outline-none appearance-none min-w-[100px] text-center"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
               </div>
            </div>

            {/* Promo Code */}
            <div ref={addToRefs} className="reveal bg-[#c9a84c]/[0.05] border border-[#c9a84c]/20 p-8 flex flex-col md:flex-row items-center gap-6">
               <div className="flex-1 w-full">
                  <div className="text-[10px] tracking-[3px] uppercase text-[#c9a84c] mb-3 font-bold">Have a Promo Code?</div>
                  <input 
                    type="text"
                    placeholder="ENTER CODE"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full bg-black/40 border border-[#c9a84c]/10 p-5 text-white uppercase tracking-widest text-[12px] outline-none focus:border-[#c9a84c] transition-all"
                  />
                  {promoError && <p className="text-red-500 text-[9px] mt-2 uppercase tracking-widest font-bold">{promoError}</p>}
                  {promoDiscount && <p className="text-green-500 text-[9px] mt-2 uppercase tracking-widest font-bold">Promo Applied: {promoDiscount.type === 'percent' ? `${promoDiscount.value}% Off` : `₹${promoDiscount.value} Off`}</p>}
               </div>
               <button 
                  onClick={applyPromo}
                  disabled={!promoCode || applyingPromo}
                  className="px-10 py-5 border border-[#c9a84c] text-[#c9a84c] text-[10px] font-black uppercase tracking-[3px] hover:bg-[#c9a84c] hover:text-[#070503] transition-all disabled:opacity-30 disabled:pointer-events-none"
               >
                  {applyingPromo ? 'Applying...' : 'Apply Code'}
               </button>
            </div>

            <button 
              onClick={() => setPhase(2)}
              className="btn-gold w-full flex items-center justify-center gap-3 py-6"
            >
              Continue to Payment <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            <div ref={addToRefs} className="reveal grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12 items-center bg-[#c9a84c]/[0.02] border border-[#c9a84c]/15 p-8 lg:p-10">
               <div className="text-center">
                  <div className="p-3 bg-white rounded-lg inline-block shadow-[0_0_50px_rgba(201,168,76,0.15)] mb-4 lg:mb-6">
                     <img src={paymentQr} alt="UPI QR" className="w-[180px] h-[180px] lg:w-[220px] lg:h-[220px]" />
                  </div>
                  <div className="text-[9px] lg:text-[11px] tracking-[3px] uppercase text-[#c9a84c] font-bold">
                     Scan with any UPI App
                  </div>
               </div>

               <div>
                  <div className="sec-tag text-[#c9a84c] text-[10px] tracking-[4px] uppercase mb-4 lg:mb-6">Instructions</div>
                  <div className="space-y-4 lg:space-y-6">
                     <div className="flex gap-4">
                        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] text-[11px] lg:text-[12px] font-bold shrink-0">1</div>
                        <p className="text-[12px] lg:text-[13px] text-[#7a6e5c] leading-relaxed">Scan the QR code and pay exactly <strong className="text-white">₹{totalAmount}</strong>.</p>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] text-[11px] lg:text-[12px] font-bold shrink-0">2</div>
                        <p className="text-[12px] lg:text-[13px] text-[#7a6e5c] leading-relaxed">Save the <strong className="text-white">Screenshot</strong> or copy the <strong className="text-white">UTR/Transaction ID</strong>.</p>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] text-[11px] lg:text-[12px] font-bold shrink-0">3</div>
                        <p className="text-[12px] lg:text-[13px] text-[#7a6e5c] leading-relaxed">After paying, click the <strong className="text-[#c9a84c]">GOLD BUTTON</strong> below to proceed.</p>
                     </div>
                  </div>
               </div>
            </div>

            <div ref={addToRefs} className="reveal space-y-4 pt-4 lg:pt-0">
               <button 
                onClick={handlePaymentDone}
                disabled={submitting}
                className="btn-gold w-full flex items-center justify-center gap-3 py-6 shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_50px_rgba(201,168,76,0.5)] transition-shadow"
               >
                 {submitting ? 'Initiating Verification...' : 'I HAVE MADE THE PAYMENT'} <ArrowRight size={18} />
               </button>
               <button onClick={() => setPhase(1)} className="w-full text-center text-[10px] tracking-[3px] uppercase text-[#7a6e5c] hover:text-[#c9a84c] py-2">Go Back & Modify Order</button>
            </div>
          </div>
        )}

        <div className="mt-16 pt-10 border-t border-white/5 flex flex-col items-center gap-4">
           <div className="flex items-center gap-3 text-[10px] tracking-[3px] uppercase text-white/10">
              <ShieldCheck size={14} /> Encrypted Payment Node • Secure Gateway
           </div>
        </div>

      </div>
    </div>
  );
}
