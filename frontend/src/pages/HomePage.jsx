import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import HeroSection from '../components/home/HeroSection';
import EpisodeShowcase from '../components/home/EpisodeShowcase';
import { StatsBanner, PosterWall, BookingStatusStrip, CTAStrip } from '../components/home/HomeSections';
import { Disc } from 'lucide-react';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredId, setFeaturedId] = useState(null);
  const [userBooking, setUserBooking] = useState(null);
  const revealRefs = useRef([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        const chrono = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const enriched = data.map(ev => ({ ...ev, episodeNum: chrono.findIndex(c => c._id === ev._id) + 1 }));
        setEvents(enriched);
        const active = enriched.find(e => e.status === 'Active');
        setFeaturedId(active?._id || enriched[0]?._id || null);
      } catch (_) {}
      finally { setLoading(false); }
    };
    const fetchBooking = async () => {
      if (!localStorage.getItem('userToken')) return;
      try {
        const { data } = await api.get('/bookings/latest');
        if (data?.length > 0) setUserBooking(data[0]);
      } catch (_) {}
    };
    fetchEvents();
    fetchBooking();
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    revealRefs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, [loading]);

  const addToRefs = (el) => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };

  const featuredEvent = events.find(e => e._id === featuredId) || events[0];
  const lastCompleted = events
    .filter(e => e.status === 'Completed' || new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  const API_ROOT = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  const mediaUrl = (url) => url?.startsWith('http') ? url : `${API_ROOT}${url}`;
  const highlightVideo = lastCompleted?.media?.find(m => m.role === 'hero_video' || m.type === 'video')?.url || lastCompleted?.videoUrl;
  const highlightImage = lastCompleted?.media?.find(m => m.role === 'hero_image' || m.role === 'cover' || m.type === 'image')?.url || lastCompleted?.imageUrl;

  return (
    <div className="bg-[#070503] text-[#f2ead8] overflow-x-hidden font-dm">

      <HeroSection featuredEvent={featuredEvent} />

      {/* Ticker */}
      <div className="border-y border-[#c9a84c]/10 bg-[#c9a84c]/[0.02] py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="inline-flex items-center gap-4 px-10 text-[10px] tracking-[2.5px] uppercase text-[#7a6e5c]">
                <strong className="font-bebas text-lg tracking-[2px] text-[#c9a84c]">{events.length}</strong> Episodes
                <div className="w-1 h-1 bg-[#c9a84c]/30 rounded-full" />
              </span>
              <span className="inline-flex items-center gap-4 px-10 text-[10px] tracking-[2.5px] uppercase text-[#7a6e5c]">
                <strong className="font-bebas text-lg tracking-[2px] text-[#c9a84c]">100%</strong> Sold Out
                <div className="w-1 h-1 bg-[#c9a84c]/30 rounded-full" />
              </span>
              <span className="inline-flex items-center gap-4 px-10 text-[10px] tracking-[2.5px] uppercase text-[#7a6e5c]">
                <Disc size={14} className="text-[#c9a84c] animate-spin-slow" /> Society
                <div className="w-1 h-1 bg-[#c9a84c]/30 rounded-full" />
              </span>
              <span className="inline-flex items-center gap-4 px-10 text-[10px] tracking-[2.5px] uppercase text-[#7a6e5c]">
                <strong className="font-bebas text-lg tracking-[2px] text-[#c9a84c]">VJA</strong> Vijayawada
                <div className="w-1 h-1 bg-[#c9a84c]/30 rounded-full" />
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Video Highlights */}
      <section ref={addToRefs} className="reveal relative h-[85vh] overflow-hidden flex items-center justify-center">
        {highlightVideo
          ? <video src={mediaUrl(highlightVideo)} className="absolute inset-0 w-full h-full object-cover grayscale opacity-30" autoPlay loop muted playsInline />
          : highlightImage
            ? <img src={mediaUrl(highlightImage)} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40" alt="Last Event" />
            : <div className="absolute inset-0 bg-gradient-to-br from-[#1c0e05] via-[#0c1825] to-[#160b1f]" />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-[#070503]/75 via-transparent to-[#070503]/85" />
        <button onClick={() => window.location.href = '/gallery'} className="relative z-10 w-24 h-24 rounded-full border border-[#c9a84c]/40 flex items-center justify-center group hover:bg-[#c9a84c]/10 hover:scale-105 active:scale-95 transition-all duration-400 shadow-[0_0_50px_rgba(201,168,76,0.1)]">
          <svg fill="#c9a84c" width="30" height="30" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <div className="absolute inset-[-10px] rounded-full border border-[#c9a84c]/15 animate-ping opacity-20" />
        </button>
        <div className="absolute bottom-20 text-center">
          <h2 className="font-playfair italic text-[clamp(26px,4vw,54px)] text-white mb-4">{lastCompleted?.name || 'Bhajan Clubbing for Gen-Z'}</h2>
          <div className="flex items-center justify-center gap-5 text-[11px] tracking-[3px] uppercase text-[#c9a84c]">
            <span>{lastCompleted?.venue || 'Dinklt Pickleball Court'}</span>
            <div className="w-1 h-1 bg-[#c9a84c]/40 rounded-full" />
            <span>{lastCompleted?.date ? new Date(lastCompleted.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : '27 March'} · {lastCompleted?.time || '6:30 PM'}</span>
          </div>
        </div>
      </section>

      <EpisodeShowcase events={events} loading={loading} featuredId={featuredId} setFeaturedId={setFeaturedId} />
      <PosterWall events={events} featuredId={featuredId} setFeaturedId={setFeaturedId} />
      <StatsBanner events={events} />
      <BookingStatusStrip userBooking={userBooking} events={events} />
      <CTAStrip />
    </div>
  );
}
