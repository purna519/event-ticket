import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disc, Sparkles, Music, Mic, Ticket, Play, CheckCircle, XCircle, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL?.replace('/api','') || 'http://localhost:5000';
const mediaUrl = (url) => url?.startsWith('http') ? url : `${API}${url}`;

// ── STATS BANNER ─────────────────────────────────────────────────────────────
export function StatsBanner({ events }) {
  const stats = [
    { num: events.length, label: 'Episodes Complete' },
    { num: '100%', label: 'Sold Out Shows' },
    { num: '5.0', label: 'Average Rating' },
    { num: '687+', label: 'Instagram Followers' },
  ];
  return (
    <section className="py-[100px] px-6 lg:px-[60px] grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#c9a84c]/10">
      {stats.map((s, i) => (
        <div key={i} className="bg-[#070503] py-14 px-10 text-center border border-[#c9a84c]/10 hover:bg-[#c9a84c]/[0.02] hover:border-[#c9a84c]/25 transition-all duration-400">
          <span className="block font-bebas text-[68px] text-[#c9a84c] leading-none mb-2">{s.num}</span>
          <span className="text-[10px] tracking-[2.5px] uppercase text-[#7a6e5c]">{s.label}</span>
        </div>
      ))}
    </section>
  );
}

// ── POSTER WALL ───────────────────────────────────────────────────────────────
export function PosterWall({ events, featuredId, setFeaturedId }) {
  const shown = events.filter(e => e.status !== 'Draft').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  return (
    <section className="py-[120px] px-6 lg:px-[60px] bg-[#0e0a05]">
      <div className="mb-12">
        <div className="sec-tag flex items-center gap-3 text-[#c9a84c] uppercase tracking-[4px] text-[10px] mb-4"><Disc size={14} /> The Vibe Board</div>
        <h2 className="font-playfair text-[clamp(32px,4vw,58px)] font-bold leading-[1.08] tracking-[-1px]">
          Every Show.<br /><em className="text-[#c9a84c] not-italic italic">A Different World.</em>
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-[3px]">
        {shown.map((event, idx) => {
          const video = event.media?.find(m => m.type === 'video');
          const cover = event.media?.find(m => m.role === 'cover' || m.role === 'hero_image' || m.type === 'image')?.url || event.imageUrl;
          return (
            <div
              key={event._id}
              className={`group relative overflow-hidden cursor-pointer ${idx === 0 ? 'row-span-2 min-h-[400px]' : 'aspect-square'} ${featuredId === event._id ? 'ring-2 ring-inset ring-[#c9a84c]' : ''}`}
              onClick={() => { setFeaturedId(event._id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              {video
                ? <video src={mediaUrl(video.url)} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                : cover
                  ? <img src={mediaUrl(cover)} alt={event.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  : <div className={`absolute inset-0 flex flex-col items-center justify-center gap-10 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105 ${idx % 3 === 0 ? 'from-[#1c0508] via-[#2c0a18] to-[#0a1028]' : idx % 3 === 1 ? 'from-[#0a1505] to-[#152010]' : 'from-[#1c1005] to-[#281808]'}`}>
                      {idx === 0 ? <Sparkles size={66} className="text-[#c9a84c]/10" /> : idx % 2 === 0 ? <Music size={48} className="text-[#c9a84c]/10" /> : <Mic size={48} className="text-[#c9a84c]/10" />}
                      <div className={`font-bebas text-[#c9a84c]/15 tracking-[4px] text-center uppercase leading-tight ${idx === 0 ? 'text-[66px]' : 'text-[19px]'}`}>{event.name}</div>
                    </div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-[#c9a84c] text-[11px] tracking-[2px] uppercase flex justify-between items-center">
                <span>Episode {event.episodeNum} &mdash; {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {video && <Play size={12} fill="currentColor" />}
              </div>
            </div>
          );
        })}
        {events.length < 4 && (
          <div className="group relative overflow-hidden aspect-square">
            <div className="absolute inset-0 bg-gradient-to-br from-[#160a1c] to-[#210f28] flex flex-col items-center justify-center gap-3 transition-transform duration-700 group-hover:scale-105">
              <Disc size={48} className="text-[#c9a84c]/10" />
              <div className="font-bebas text-[19px] text-[#c9a84c]/15 tracking-[4px] uppercase">EPISODE {events.filter(e => e.status !== 'Draft').length + 1}</div>
              <div className="text-[9px] tracking-[3px] uppercase text-[#c9a84c]/20">Coming Soon</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent text-[#c9a84c] text-[11px] tracking-[2px] uppercase">Stay Tuned</div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── BOOKING STATUS STRIP ──────────────────────────────────────────────────────
export function BookingStatusStrip({ userBooking, events }) {
  const navigate = useNavigate();
  if (!userBooking) return null;
  const ep = events.find(e => e._id === userBooking.eventId?._id);
  const icon = userBooking.status === 'verified' ? <CheckCircle size={24} /> : userBooking.status === 'rejected' ? <XCircle size={24} /> : <Clock size={24} />;
  const color = userBooking.status === 'verified' ? 'green' : userBooking.status === 'rejected' ? 'red' : 'gold';
  const colorMap = { green: 'bg-green-500/10 border-green-500/30 text-green-500', red: 'bg-red-500/10 border-red-500/30 text-red-500', gold: 'bg-[#c9a84c]/10 border-[#c9a84c]/30 text-[#c9a84c]' };
  const label = userBooking.status === 'verified' ? 'Access Granted' : userBooking.status === 'rejected' ? 'Verification Failed' : 'Scanning Payment Ledger...';

  return (
    <section className="py-16 px-6 lg:px-[60px] bg-[#070503] border-t border-white/5 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none"><Sparkles size={180} className="text-[#c9a84c]" /></div>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 border flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[3px] text-[#7a6e5c] mb-1">Transmission Status</h4>
            <p className="font-playfair text-xl text-white italic">{label}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center lg:justify-end items-center gap-12">
          <div className="text-center">
            <span className="block text-[8px] uppercase tracking-[2px] text-[#7a6e5c] mb-1">Production</span>
            <span className="block text-[11px] text-white font-bold tracking-widest uppercase">Ep.{ep?.episodeNum || '?'} {userBooking.eventId?.name}</span>
          </div>
          <div className="text-center">
            <span className="block text-[8px] uppercase tracking-[2px] text-[#7a6e5c] mb-1">Booking Node</span>
            <span className="block text-[11px] text-[#c9a84c] font-mono uppercase tracking-tighter">{userBooking._id.slice(-8)}</span>
          </div>
          <button onClick={() => navigate(`/status/${userBooking._id}`)} className="px-8 py-4 border border-[#c9a84c]/40 text-[#c9a84c] text-[9px] font-black uppercase tracking-[3px] hover:bg-[#c9a84c] hover:text-black transition-all">
            View Secure Pass
          </button>
        </div>
      </div>
    </section>
  );
}

// ── CTA STRIP ─────────────────────────────────────────────────────────────────
export function CTAStrip() {
  return (
    <section className="py-[90px] px-6 lg:px-[60px] bg-[#c9a84c] flex flex-col lg:flex-row items-center justify-between gap-10">
      <div className="font-playfair text-[clamp(22px,3vw,42px)] font-bold text-[#070503] italic max-w-[600px] text-center lg:text-left leading-[1.3]">
        "Where every stranger is a fellow musician waiting to sing along."
      </div>
      <div className="flex flex-col items-center lg:items-end gap-2">
        <div className="font-bebas text-[60px] text-[#070503] leading-none">VJA</div>
        <div className="text-[10px] tracking-[3px] uppercase text-[#070503]/60 mb-6">Vijayawada, India</div>
        <Link to="/events" className="btn-gold !bg-[#070503] !text-[#c9a84c] !shadow-none hover:opacity-90">
          <Ticket size={16} className="inline mr-2" /> Get Tickets
        </Link>
      </div>
    </section>
  );
}
