import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Ticket, Clock, CheckCircle, XCircle, Download, Info, Loader2, ArrowLeft, ShieldCheck, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [reviewModal, setReviewModal] = useState({ show: false, bookingId: null, eventId: null });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const navigate = useNavigate();
  const revealRefs = useRef([]);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target); // Unobserve once visible
          }
        });
      },
      { threshold: 0.1 }
    );

    // Give React a moment to render the newly populated revealRefs
    const timer = setTimeout(() => {
      revealRefs.current.forEach(ref => {
        if (ref) observer.observe(ref);
      });
    }, 100);

    return () => {
        observer.disconnect();
        clearTimeout(timer);
    };
  }, [loading]);


  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (bookingId, ticketId) => {
    try {
      const resp = await api.get(`/bookings/ticket/${bookingId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download ticket');
    }
  };

  const submitReview = async () => {
      if (!comment.trim()) return alert('Please write a short review.');
      setSubmittingReview(true);
      try {
          await api.post('/reviews', {
              eventId: reviewModal.eventId,
              bookingId: reviewModal.bookingId,
              rating,
              comment
          });
          alert('Review submitted successfully! Thank you for the community love.');
          setReviewModal({ show: false, bookingId: null, eventId: null });
          setComment('');
          setRating(5);
      } catch (err) {
          alert(err.response?.data?.msg || 'Failed to submit review.');
      } finally {
          setSubmittingReview(false);
      }
  };

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
      <div className="max-w-5xl mx-auto">
        <div ref={addToRefs} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3">Member Portal</div>
            <h1 className="font-playfair text-[clamp(42px,5vw,72px)] font-black leading-[0.9] tracking-[-2px] text-white">
               My<br /><em className="text-[#c9a84c] not-italic italic">Bookings</em>
            </h1>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
             <div className="badge border border-[#c9a84c]/20 text-[#c9a84c] px-4 py-2 text-[10px] uppercase tracking-widest font-bold">
                {bookings.length} Orders Found
             </div>
             <p className="text-[11px] text-[#7a6e5c]">Real-time status updates every 15s</p>
          </div>
        </div>

        {/* Note */}
        <div ref={addToRefs} className="reveal bg-[#c9a84c]/[0.05] border border-[#c9a84c]/15 p-8 flex items-start gap-6 mb-12">
           <div className="w-10 h-10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] flex-shrink-0">
              <Info size={18} />
           </div>
           <div>
              <p className="text-[12px] text-white font-medium mb-1 uppercase tracking-tight">Post-Verification Information</p>
              <p className="text-[11px] text-[#7a6e5c] leading-relaxed uppercase tracking-widest">
                 Once verified, your tickets will appear here with a <span className="text-[#c9a84c]">Download PDF</span> option.
                 We also send an automated email with your QR code.
              </p>
           </div>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div ref={addToRefs} className="reveal text-center py-24 bg-white/5 border border-white/5">
              <Ticket className="w-12 h-12 text-[#c9a84c]/20 mx-auto mb-6" />
              <p className="text-[#7a6e5c] text-[11px] tracking-[3px] uppercase mb-8">No memories found yet.</p>
              <Link to="/events" className="btn-gold !bg-transparent !border !border-[#c9a84c] !text-[#c9a84c] hover:!bg-[#c9a84c] hover:!text-[#070503]">Explore Episodes</Link>
            </div>
          ) : (
            bookings.map((b, i) => (
              <div 
                key={b._id} 
                ref={addToRefs}
                className="reveal bg-[#c9a84c]/[0.02] border border-[#c9a84c]/10 p-8 md:p-10 transition-all duration-400 hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/[0.04]"
              >
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex items-start gap-6">
                     <div className={`w-14 h-14 border flex items-center justify-center flex-shrink-0 ${
                       b.status === 'verified' ? 'border-green-500/30 text-green-500' :
                       b.status === 'rejected' ? 'border-red-500/30 text-red-500' : 'border-[#c9a84c]/30 text-[#c9a84c]'
                     }`}>
                        {b.status === 'verified' ? <CheckCircle size={24} /> :
                         b.status === 'rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="font-playfair text-2xl font-bold text-white">{b.quantity} {b.quantity === 1 ? 'Entry Pass' : 'Entry Passes'}</h3>
                           <span className={`text-[9px] tracking-[2px] uppercase font-bold px-3 py-1 border ${
                             b.status === 'verified' ? 'border-green-500/20 text-green-500' :
                             b.status === 'rejected' ? 'border-red-500/20 text-red-500' : 'border-[#c9a84c]/20 text-[#c9a84c]'
                           }`}>
                             {b.status}
                           </span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] tracking-[1.5px] uppercase text-[#7a6e5c]">
                           <span>Order ID: <span className="text-white/40">{b._id.slice(-8).toUpperCase()}</span></span>
                           <span>UTR: <span className="text-white/40">{b.utr || 'PENDING'}</span></span>
                           <span>Date: <span className="text-white/40">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></span>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col md:items-end justify-center gap-4">
                     {b.status === 'verified' ? (
                       <div className="flex flex-col gap-2">
                           <button 
                            onClick={() => handleDownload(b._id, b.ticketId)}
                            className="btn-gold !p-[12px_32px] flex items-center justify-center gap-2"
                           >
                             <Download size={14} /> Download PDF
                           </button>
                           <button 
                            onClick={() => setReviewModal({ show: true, bookingId: b._id, eventId: b.event?._id || b.event })}
                            className="w-full text-[10px] tracking-[2px] uppercase font-bold p-[10px_32px] border border-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#070503] transition-colors"
                           >
                             ★ Rate Experience
                           </button>
                       </div>
                     ) : b.status === 'initiated' ? (
                        <button 
                          onClick={() => navigate(`/status/${b._id}`)}
                          className="btn-gold !bg-transparent !border !border-[#c9a84c] !text-[#c9a84c] !p-[12px_32px]"
                        >
                          View Status
                        </button>
                     ) : b.status === 'rejected' ? (
                        <button 
                          onClick={() => navigate('/events')}
                          className="btn-gold !bg-red-500/20 !border !border-red-500/30 !text-red-500 !p-[12px_32px]"
                        >
                          New Booking
                        </button>
                     ) : (
                        <div className="text-[10px] tracking-[2px] uppercase text-[#7a6e5c] border border-dashed border-[#c9a84c]/20 p-[12px_32px]">
                           Verification in Progress
                        </div>
                     )}
                     
                     <Link to={`/status/${b._id}`} className="text-[9px] tracking-[2px] uppercase text-[#c9a84c] hover:underline text-right">View Detailed Status</Link>
                  </div>
                </div>

                {b.status === 'rejected' && b.rejectionReason && (
                   <div className="mt-8 pt-6 border-t border-red-500/10 text-red-400 text-[11px] font-medium tracking-tight bg-red-500/5 p-4">
                      Rejection Reason: {b.rejectionReason}
                   </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] tracking-[3px] uppercase text-white/10 select-none">
           <ShieldCheck size={14} /> Encrypted Booking Ledger
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.show && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md transition-opacity">
            <div className="bg-[#0e0a05] border border-[#c9a84c]/30 p-[50px] max-w-lg w-full relative transform transition-transform animate-hero-in">
               <button 
                 onClick={() => setReviewModal({ show: false, bookingId: null, eventId: null })}
                 className="absolute top-6 right-6 text-[#7a6e5c] hover:text-[#c9a84c] transition-colors"
               >
                 <XCircle size={24} />
               </button>
               
               <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3">Rate Production</div>
               <h3 className="font-playfair text-[38px] font-bold leading-none mb-8 text-white">Share The <em className="text-[#c9a84c] not-italic italic">Vibe</em></h3>

               <div className="flex gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map(star => (
                     <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                        <Star size={34} fill={star <= rating ? '#c9a84c' : 'transparent'} className={star <= rating ? 'text-[#c9a84c]' : 'text-white/10 stroke-[#c9a84c]/30'} />
                     </button>
                  ))}
               </div>

               <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the community? The music? Let us know..."
                  className="w-full bg-white/[0.02] border border-white/10 p-5 text-[14px] text-white/90 placeholder:text-[#7a6e5c]/50 h-[130px] resize-none focus:outline-none focus:border-[#c9a84c]/50 transition-colors mb-8"
               />

               <button 
                 onClick={submitReview}
                 disabled={submittingReview}
                 className="btn-gold w-full flex items-center justify-center gap-2 !py-5 text-[12px] tracking-[3px]"
               >
                  {submittingReview ? <Loader2 size={16} className="animate-spin" /> : 'Publish Translation of Magic'}
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
