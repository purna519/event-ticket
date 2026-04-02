import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Ticket, QrCode, FileText, RefreshCcw, ArrowLeft, ShieldCheck, Mail, Phone, User, AlertCircle, Download, Share2 } from 'lucide-react';
import api from '../api';

export default function StatusPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(10);
  const revealRefs = useRef([]);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get(`/bookings/status/${bookingId}`);
      setBooking(data);
      
      if (data.status === 'verified' && data.tickets) {
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
    if (loading) return;

    const observer = new IntersectionObserver(
        (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
        { threshold: 0.1 }
      );
      revealRefs.current.forEach(ref => ref && observer.observe(ref));
      return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    if (!booking || (booking.status !== 'pending' && booking.status !== 'initiated')) return;

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

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const handleDownloadPDF = async () => {
    try {
        const resp = await api.get(`/bookings/ticket/${bookingId}`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([resp.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ticket-${bookingId.slice(-6)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        alert('Failed to download ticket');
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070503] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070503] flex items-center justify-center p-6">
        <div className="card text-center !p-12 border-red-500/20 bg-red-500/5 max-w-md">
          <div className="text-red-500 mb-6 flex justify-center"><AlertCircle size={48} strokeWidth={1} /></div>
          <p className="text-red-400 font-black uppercase tracking-widest text-[10px] mb-8">{error}</p>
          <button onClick={() => navigate('/')} className="btn-gold !bg-red-500 !text-white w-full">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#070503] pt-[120px] pb-[100px] px-6 md:px-[60px]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div ref={addToRefs} className="reveal mb-16 text-center">
           <div className={`inline-flex items-center gap-3 uppercase tracking-[4px] text-[10px] mb-4 font-bold ${
             booking.status === 'verified' ? 'text-green-500' : 
             booking.status === 'rejected' ? 'text-red-500' : 'text-[#c9a84c]'
           }`}>
             {booking.status === 'verified' ? <CheckCircle size={14} /> : 
              booking.status === 'rejected' ? <XCircle size={14} /> : <Clock size={14} />}
             {booking.status} Status
           </div>
           <h1 className="font-playfair text-[clamp(32px,5vw,62px)] font-black leading-[1] tracking-[-2px] text-white">
              {booking.status === 'verified' ? 'Access Confirmed' : 
               booking.status === 'rejected' ? 'Review Failed' : 'Security Clearance'}
           </h1>
        </div>

        {/* ── VERIFIED ── */}
        {booking.status === 'verified' && (
           <div className="space-y-8">
              {(booking.tickets || [{ ticketId: booking.ticketId }]).map((t, idx) => (
                <div key={t.ticketId} ref={addToRefs} className="reveal bg-[#c9a84c]/[0.02] border border-[#c9a84c]/15 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none">
                      <Ticket size={240} />
                   </div>

                   <div className="p-10 relative z-10 flex flex-col md:flex-row gap-12 items-center">
                      {/* QR */}
                      {qr && qr[t.ticketId] && (
                         <div className="p-4 bg-white rounded-lg shadow-[0_0_50px_rgba(201,168,76,0.15)] flex-shrink-0">
                            <img src={qr[t.ticketId]} alt="QR" className="w-[180px] h-[180px]" />
                         </div>
                      )}

                      {/* Info */}
                      <div className="flex-1">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                               <div className="text-[9px] tracking-[3px] uppercase text-[#c9a84c] mb-1">Pass Holder</div>
                               <div className="font-playfair text-3xl font-bold text-white">{booking.name}</div>
                            </div>
                            <div className="text-right">
                               <div className="text-[9px] tracking-[3px] uppercase text-[#7a6e5c] mb-1">Pass {idx+1}/{booking.quantity}</div>
                               <div className="font-mono text-[11px] text-[#c9a84c]">{t.ticketId}</div>
                            </div>
                         </div>

                         <div className="space-y-3 border-t border-white/5 pt-6">
                            <div className="flex items-center gap-3 text-[11px] text-[#7a6e5c] uppercase tracking-widest">
                               <CheckCircle size={14} className="text-green-500" /> Authenticated Entry
                            </div>
                            <p className="text-[12px] text-[#7a6e5c] leading-relaxed italic">
                               "As voices unite, the melody transcends. Present this code at the gate for seamless entry into the soundscape."
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}

              <div ref={addToRefs} className="reveal flex flex-col sm:flex-row gap-4">
                 <button onClick={handleDownloadPDF} className="btn-gold flex-1 flex items-center justify-center gap-3">
                    <Download size={16} /> Download Master PDF
                 </button>
                 <button className="btn-ghost flex-1 flex items-center justify-center gap-3">
                    <Share2 size={16} /> Share Pass
                 </button>
              </div>
           </div>
        )}

        {/* ── PENDING/INITIATED ── */}
        {(booking.status === 'pending' || booking.status === 'initiated') && (
           <div ref={addToRefs} className="reveal max-w-xl mx-auto text-center space-y-10">
              <div className="p-16 border border-dashed border-[#c9a84c]/20 bg-[#c9a84c]/[0.02]">
                 <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-2 border-[#c9a84c]/10 rounded-full" />
                    <div className="absolute inset-0 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
                    <Clock size={32} className="absolute inset-0 m-auto text-[#c9a84c] animate-pulse" />
                 </div>
                 <h2 className="font-playfair text-2xl font-bold mb-4">Verifying Transaction</h2>
                 <p className="text-[13px] text-[#7a6e5c] leading-relaxed mb-8">
                    We are currently matching your UTR code <span className="text-[#c9a84c]">{booking.utr || 'PENDING'}</span> against our bank records. This typically takes 5–15 minutes during peak hours.
                 </p>
                 <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c]/40">Next sync in {countdown}s</div>
              </div>
              
              {booking.status === 'initiated' && (
                <button onClick={() => navigate('/submit')} className="btn-gold w-full mt-4">
                   Submit Transaction ID (UTR)
                </button>
              )}

              <button onClick={fetchStatus} className="text-[10px] tracking-[3px] uppercase text-[#7a6e5c] hover:text-[#c9a84c] flex items-center gap-2 mx-auto">
                 <RefreshCcw size={12} /> Force Manual Sync
              </button>
           </div>
        )}

        {/* ── REJECTED ── */}
        {booking.status === 'rejected' && (
           <div ref={addToRefs} className="reveal max-w-xl mx-auto space-y-8">
              <div className="p-10 border border-red-500/20 bg-red-500/[0.02] text-center">
                 <XCircle size={48} className="text-red-500 mx-auto mb-6" />
                 <h2 className="font-playfair text-2xl font-bold mb-4">Verification Unsuccessful</h2>
                 <p className="text-[13px] text-[#7a6e5c] leading-relaxed mb-8">
                    {booking.rejectionReason || 'We could not find a matching transaction for the UTR provided. Please double check your bank statement.'}
                 </p>
                 <button onClick={() => navigate('/submit')} className="btn-gold !bg-red-500 !text-white w-full">
                    Retry UTR Submission
                 </button>
              </div>
              
              <div className="text-center text-[11px] text-[#7a6e5c] uppercase tracking-widest">
                 Need help? DM us on Instagram <a href="https://instagram.com/themusicsociety26" target="_blank" rel="noreferrer" className="text-[#c9a84c] underline">@themusicsociety26</a>
              </div>
           </div>
        )}

        <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] tracking-[3px] uppercase text-white/10 select-none">
           <ShieldCheck size={14} /> Verification Node ID: MS-{bookingId.slice(-6).toUpperCase()}
        </div>

      </div>
    </div>
  );
}
