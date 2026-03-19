// ─── pages/StatusPage.jsx ─────────────────────────────────────────────────────
// Shows booking verification status with unified layout.
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Ticket, QrCode, FileText, RefreshCcw, ArrowLeft, ShieldCheck, Mail, Phone, User, AlertCircle } from 'lucide-react';
import api from '../api';
import StepIndicator from '../components/StepIndicator';
import PublicLayout from '../components/PublicLayout';

export default function StatusPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(10);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get(`/bookings/status/${bookingId}`);
      setBooking(data);
      
      if (data.status === 'verified' && data.tickets) {
        // Fetch QRs for all tickets in parallel
        const qrPromises = data.tickets.map(t => api.get(`/bookings/qr/${t.ticketId}`));
        const qrResults = await Promise.all(qrPromises);
        const qrMap = {};
        qrResults.forEach(res => {
          qrMap[res.data.ticketId] = res.data.qr;
        });
        setQr(qrMap);
      }
    } catch (err) {
      setError('Could not load booking status.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!booking || booking.status !== 'pending') return;

    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          fetchStatus();
          return 10;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [booking?.status, fetchStatus]);

  const handleDownloadPDF = () => {
    window.open(`/api/bookings/ticket/${bookingId}`, '_blank');
  };

  const handleShare = async () => {
    try {
      const ticketUrl = `${window.location.origin}/api/bookings/ticket/${bookingId}`;
      const msg = `Got my Bhajan Ticket! 🎶 Confirming my entry for the devotional experience. Download ticket: ${ticketUrl}`;
      
      // Try Native Share if on mobile and file sharing is supported
      if (navigator.share) {
        try {
          const response = await fetch(`/api/bookings/ticket/${bookingId}`);
          const blob = await response.blob();
          const file = new File([blob], `bhajan-ticket-${booking.ticketId}.pdf`, { type: 'application/pdf' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Bhajan Ticket',
              text: 'My ticket for the devotional jamming experience!',
            });
            return;
          }
        } catch (shareErr) {
          console.log('Native share failed, falling back to link');
        }
      }

      // Fallback: WhatsApp Link
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (err) {
       window.open(`https://wa.me/?text=${encodeURIComponent(`Got my Bhajan Ticket! Check status: ${window.location.href}`)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-10 h-10 border-[3px]" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">Reading Ledger…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="animate-slide-up px-4">
          <div className="card text-center !p-12 border-red-500/20 bg-red-500/5">
            <div className="text-red-500 mb-6 flex justify-center"><AlertCircle size={48} strokeWidth={1} /></div>
            <p className="text-red-400 font-black uppercase tracking-widest text-xs mb-8">{error}</p>
            <button onClick={() => navigate('/')} className="btn-secondary w-full py-4 text-[10px] font-black uppercase tracking-widest">
              Go Home
            </button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="animate-slide-up">
        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator current={3} />
        </div>

        {/* Status Content */}
        <div className="space-y-12">
          
          {/* ── Verified State ────────────────────────────────────────────────── */}
          {booking.status === 'verified' && (
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={16} className="text-white/60" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 font-sans">Verification Successful</p>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.95]">
                  Entry Highly<br />Confirmed
                </h1>
              </div>

              <div className="grid gap-6">
                {(booking.tickets || [{ ticketId: booking.ticketId }]).map((t, idx) => (
                  <div key={t.ticketId} className="card !p-0 overflow-hidden bg-white/[0.01] border-white/10 group relative shadow-[0_40px_100px_rgba(255,255,255,0.03)]">
                    {/* Visual Flair */}
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                      <Ticket size={80} strokeWidth={0.5} className="rotate-12" />
                    </div>

                    <div className="p-8 space-y-6 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em]">HOLDER IDENTITY</p>
                          <h2 className="text-white font-black text-2xl tracking-tight uppercase">{booking.name}</h2>
                        </div>
                        <div className="text-right">
                          <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em]">TICKET {idx + 1} / {booking.quantity || 1}</p>
                          <p className="text-white/40 text-[10px] font-mono font-bold mt-1">{t.ticketId}</p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-10 pt-4">
                        {qr && qr[t.ticketId] && (
                          <div className="relative group/qr">
                            <div className="absolute -inset-4 bg-white/5 rounded-[2rem] blur-xl opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                            <div className="relative p-2 bg-white rounded-2xl shadow-2xl">
                              <img src={qr[t.ticketId]} alt="Ticket QR" className="w-32 h-32" />
                            </div>
                          </div>
                        )}
                        <div className="flex-1 space-y-4 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2">
                             {t.scanned ? (
                               <span className="badge-verified"><CheckCircle size={10} /> Checked In</span>
                             ) : (
                               <span className="badge-pending"><Clock size={10} /> Valid Entry</span>
                             )}
                          </div>
                          <p className="text-white/30 text-[10px] font-medium leading-relaxed max-w-[200px] mx-auto md:mx-0">
                            Present this QR at the entrance for verification. Screenshot allowed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div className="card bg-white/[0.02] border-white/5 !p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-white font-black text-xs uppercase tracking-widest">Master PDF</p>
                      <p className="text-white/20 text-[10px] font-bold">ALL {booking.quantity} TICKETS IN ONE FILE</p>
                    </div>
                  </div>
                  <button onClick={handleDownloadPDF} className="btn-secondary w-auto px-6 py-3 text-[9px] font-black uppercase tracking-widest">
                     Download Master Ticket
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={handleShare}
                    className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    Share on WhatsApp
                  </button>
                  
                  <div className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest">
                    <Phone size={14} /> Support: {event?.supportNumber || '7093237728'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Pending State ────────────────────────────────────────────────── */}
          {booking.status === 'pending' && (
            <div className="space-y-10">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <Clock size={16} className="text-white/40 animate-pulse" />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Manual Review Required</p>
                  </div>
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.95]">
                     Validation<br />In Progress
                  </h1>
               </div>

               <div className="card !p-10 flex flex-col items-center text-center gap-6 bg-black/40 border-white/5">
                  <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-white transition-all duration-1000 ease-linear shadow-[0_0_15px_white]" 
                      style={{ width: `${(countdown / 10) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">NEXT SYNC IN {countdown}S</p>
                     <p className="text-white/50 text-[13px] font-medium leading-relaxed max-w-[280px]">
                        Our security team is matching your UTR code against bank records. This typically takes 5–20 minutes.
                     </p>
                  </div>
                  <button onClick={fetchStatus} className="btn-secondary w-auto px-6 py-3 rounded-xl border-white/5 text-[9px] uppercase tracking-widest font-black">
                     <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} /> Force Refresh
                  </button>
               </div>
            </div>
          )}

          {/* ── Rejected State ───────────────────────────────────────────────── */}
          {booking.status === 'rejected' && (
            <div className="space-y-10">
               <div>
                  <div className="flex items-center gap-3 mb-4 text-red-500/60">
                     <XCircle size={16} />
                     <p className="text-[10px] font-black uppercase tracking-[0.4em]">Validation Failed</p>
                  </div>
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.95]">
                     Booking<br />Rejected
                  </h1>
               </div>

               <div className="card !p-10 border-red-500/10 bg-red-500/[0.02]">
                  <p className="text-red-400 text-xs font-bold leading-relaxed mb-8 border-l-2 border-red-500/20 pl-4">
                     {booking.rejectionReason || 'We could not verify your transaction ID. Please check your bank statement and try again.'}
                  </p>
                  <button onClick={() => navigate('/submit')} className="btn-primary py-5 text-[10px] font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 shadow-red-500/5">
                    Re-submit Transaction
                  </button>
               </div>
            </div>
          )}

          <div className="pt-8 flex justify-center">
            <button
               onClick={() => navigate('/')}
               className="flex items-center gap-2 text-white/20 hover:text-white/40 text-[9px] font-black uppercase tracking-[0.3em] transition-all"
            >
               <ArrowLeft size={12} /> Return to Entrance
            </button>
          </div>

          <p className="text-center flex items-center justify-center gap-2 text-[9px] text-white/10 font-black uppercase tracking-widest mt-12 animate-pulse-slow">
            <ShieldCheck size={12} /> Verification node: 0xA4F9..33D
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
