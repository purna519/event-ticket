import React, { useEffect, useState, useRef } from 'react';
import { Star, MessageSquareDot, CircleDot, Loader2 } from 'lucide-react';
import api from '../api';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach(ref => ref && observer.observe(ref));
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews');
        setReviews(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
  const breakdown = [5, 4, 3, 2, 1].map(star => ({
      star,
      pct: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : (star === 5 ? 100 : 0)
  }));

  return (
    <div className="bg-[#070503] pt-[70px]">
      <div className="relative h-[52vh] min-h-[340px] flex items-end px-6 md:px-[60px] pb-[60px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c0508] via-[#10131c] to-[#080604]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-transparent to-transparent" />
        </div>
        <div className="relative z-10">
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-[14px] flex items-center gap-3">
             <MessageSquareDot size={12} /> Community Love
          </div>
          <h1 className="font-playfair text-[clamp(42px,6vw,82px)] font-black leading-[0.9] tracking-[-2px] text-white">
            What They<br /><em className="text-[#c9a84c] not-italic italic">Said</em>
          </h1>
        </div>
      </div>

      <div className="py-[60px] px-6 md:px-[60px] pb-[100px]">
        {/* Overview Box */}
        <div ref={addToRefs} className="reveal grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-20 items-center border-b border-[#c9a84c]/10 pb-20 mb-20">
           <div className="text-center border border-[#c9a84c]/20 p-[52px_44px]">
              <div className="font-bebas text-[110px] text-[#c9a84c] leading-none">{avgRating}</div>
              <div className="flex justify-center gap-2 text-[#c9a84c] text-[22px] my-3">
                 {[...Array(5)].map((_, i) => <Star key={i} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "transparent"} size={24} className={i < Math.round(Number(avgRating)) ? "" : "text-white/20 stroke-current"} />)}
              </div>
              <div className="text-[11px] tracking-[2px] uppercase text-[#7a6e5c]">{reviews.length > 0 ? reviews.length : '0'} Attendees Reviewed</div>
           </div>
           
           <div>
              <div className="sec-tag flex items-center gap-3 text-[#c9a84c] uppercase tracking-[4px] text-[10px] mb-8">
                 <CircleDot size={8} /> Rating Breakdown
              </div>
              <div className="space-y-4 max-w-[500px]">
                 {breakdown.map(b => (
                   <div key={b.star} className="flex items-center gap-4 text-[12px] text-[#7a6e5c]">
                      <span className="w-4">{b.star}</span>
                      <div className="flex-1 h-[2px] bg-[#c9a84c]/10">
                         <div className="h-full bg-[#c9a84c]" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span className="w-8 text-right">{b.pct}%</span>
                   </div>
                 ))}
              </div>
              <p className="mt-8 text-[14px] text-[#7a6e5c] leading-relaxed italic max-w-[500px]">
                Every single event has been a full house with zero empty hearts. Vijayawada has never felt this musical.
              </p>
           </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
           {loading ? (
             <div className="col-span-full py-20 flex justify-center">
               <Loader2 size={32} className="text-[#c9a84c] animate-spin" />
             </div>
           ) : reviews.length === 0 ? (
             <div className="col-span-full py-20 text-center text-[#7a6e5c] tracking-[4px] uppercase text-[10px]">
                No reviews found yet.
             </div>
           ) : (
             reviews.map((r, i) => (
               <div key={i} ref={addToRefs} className="reveal bg-[#c9a84c]/[0.03] border border-[#c9a84c]/10 p-10 transition-all duration-300 hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/[0.05]">
                  <div className="flex gap-1 text-[#c9a84c] text-[13px] mb-5">
                     {[...Array(5)].map((_, j) => <Star key={j} fill={j < r.rating ? "currentColor" : "transparent"} size={14} className={j < r.rating ? "" : "text-white/20 stroke-current"} />)}
                  </div>
                  <p className="font-cormorant italic text-[19px] leading-relaxed text-white mb-7">"{r.comment}"</p>
                  <div className="flex items-center gap-4">
                     <div className="w-11 h-11 bg-[#c9a84c] rounded-full flex items-center justify-center font-playfair font-bold text-[#070503]">{r.user?.name ? r.user.name[0] : '?'}</div>
                     <div>
                        <div className="text-[13px] font-semibold text-white">{r.user?.name || 'Anonymous User'}</div>
                        <div className="text-[11px] text-[#7a6e5c]">{r.event?.name ? `Ep. ${r.event.episodeNum} — ${r.event.name}` : 'The Music Society'}</div>
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
