import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc, Circle, Calendar, MapPin } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL?.replace('/api','') || 'http://localhost:5000';
const mediaUrl = (url) => url?.startsWith('http') ? url : `${API}${url}`;

function EventCard({ event, featuredId, setFeaturedId, isPast }) {
  const navigate = useNavigate();
  const poster = event.media?.find(m => m.role === 'cover')?.url || event.imageUrl;

  return (
    <div
      className={`relative aspect-[2/3] group overflow-hidden transition-all duration-500 cursor-pointer ${featuredId === event._id ? 'ring-2 ring-[#c9a84c]' : 'opacity-80 hover:opacity-100'}`}
      onClick={() => { setFeaturedId(event._id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
    >
      {poster
        ? <img src={mediaUrl(poster)} alt={event.name} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isPast ? 'grayscale' : ''}`} />
        : <div className={`absolute inset-0 bg-gradient-to-br ${isPast ? 'from-[#070503] via-[#1a1a1a] to-[#070503]' : 'from-[#1c0508] via-[#2e0a1c] to-[#0a1028]'} transition-transform duration-700 group-hover:scale-110`} />
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent" />
      <div className="absolute inset-0 p-10 flex flex-col justify-end">
        <div className="font-bebas text-[76px] text-[#c9a84c]/10 leading-none -mb-3">{String(event.episodeNum).padStart(2, '0')}</div>
        {isPast
          ? <span className="inline-flex items-center gap-2 px-3 py-1 text-[9px] font-bold uppercase tracking-wider mb-4 bg-red-500/20 text-red-500 border border-red-500/30"><Circle size={6} fill="currentColor" /> Production Concluded</span>
          : <span className="inline-flex items-center gap-2 px-3 py-1 text-[9px] font-bold uppercase tracking-wider mb-4 bg-[#c9a84c] text-[#070503] animate-pulse"><Circle size={6} fill="currentColor" /> Live Transmission</span>
        }
        <h3 className={`font-bebas text-[clamp(42px,4vw,64px)] leading-[0.85] tracking-tight mb-4 transition-colors ${isPast ? 'text-white/50 group-hover:text-white' : 'text-white group-hover:text-[#c9a84c]'}`}>{event.name}</h3>
        <div className={`flex flex-wrap items-center gap-6 text-[10px] tracking-widest uppercase font-bold mb-8 ${isPast ? 'text-white/30' : 'text-white/50'}`}>
          <span className="flex items-center gap-2"><Calendar size={12} className={isPast ? '' : 'text-[#c9a84c]'} /> {new Date(event.date).toLocaleDateString()}</span>
          <span className="flex items-center gap-2"><MapPin size={12} className={isPast ? '' : 'text-[#c9a84c]'} /> {event.venue}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/events/${event._id || event.slug}`); }}
          className={`w-full py-5 text-[10px] font-black uppercase tracking-[4px] border transition-all ${isPast ? 'border-white/10 text-white/40 hover:bg-white/5 hover:text-white' : 'bg-[#c9a84c] border-[#c9a84c] text-[#070503] hover:bg-black hover:text-[#c9a84c]'}`}
        >
          {isPast ? 'View Archive' : 'Enter Transmission'}
        </button>
      </div>
    </div>
  );
}

export default function EpisodeShowcase({ events, loading, featuredId, setFeaturedId }) {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const live = events.filter(e => e.status === 'Active' && new Date(e.date) >= today);
  const past = events.filter(e => e.status === 'Completed' || new Date(e.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section className="py-[120px] px-6 lg:px-[60px]">
      <div className="mb-12">
        <div className="sec-tag flex items-center gap-3 text-[#c9a84c] uppercase tracking-[4px] text-[10px] mb-4">
          <Disc size={14} /> Our Episodes
        </div>
        <h2 className="font-playfair text-[clamp(32px,4vw,58px)] font-bold leading-[1.08] tracking-[-1px]">
          Live Productions.<br />
          <em className="text-[#c9a84c] not-italic italic">Infinite Echoes.</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px]">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse text-[#c9a84c] tracking-[4px] uppercase text-[10px]">Loading Productions...</div>
        ) : events.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[#7a6e5c] tracking-[4px] uppercase text-[10px]">No Active Transmissions Found.</div>
        ) : (
          <>
            {live.map(e => <EventCard key={e._id} event={e} featuredId={featuredId} setFeaturedId={setFeaturedId} isPast={false} />)}
            {past.map(e => <EventCard key={e._id} event={e} featuredId={featuredId} setFeaturedId={setFeaturedId} isPast={true} />)}
          </>
        )}
      </div>
    </section>
  );
}
