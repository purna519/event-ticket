import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Ticket, MapPin, Clock, Mic, Ban, Circle, Bell, Images, 
  Disc, Music, ArrowLeft, ArrowRight, Play, Sparkles, Award, Star, 
  CheckCircle, ShieldCheck, Instagram, Youtube, Globe,
  Maximize2, ChevronRight, ChevronLeft, Calendar
} from 'lucide-react';
import api from '../api';

export default function EventPage() {
  const { id: paramId } = useParams();
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeMedia, setActiveMedia] = useState(0);
  const navigate = useNavigate();
  const revealRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: allEvents } = await api.get('/events');
        const chrono = [...allEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
        const enriched = allEvents.map(ev => ({
            ...ev,
            episodeNum: chrono.findIndex(c => c._id === ev._id) + 1
        }));
        setEvents(enriched);

        if (paramId) {
           const target = enriched.find(e => e._id === paramId || e.slug === paramId);
           if (target) {
              setEvent(target);
           } else {
              // Fallback to direct fetch if not in list
              try {
                const { data: single } = await api.get(`/events/${paramId}`);
                const ep = enriched.find(e => e._id === single._id)?.episodeNum || '?';
                setEvent({ ...single, episodeNum: ep });
              } catch (e) { console.error('Single fetch fail', e); }
           }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [paramId]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [loading, activeFilter, event]);

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070503] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full" />
          <p className="font-bebas text-[#c9a84c] text-xs tracking-widest uppercase italic">Initialising Experience…</p>
        </div>
      </div>
    );
  }

  // ─── DETAIL VIEW ───────────────────────────────────────────────────────────
  if (paramId && event) {
    const gallery = event.media || [];
    const isExpired = new Date(event.date) < new Date(new Date().setHours(0,0,0,0));
    
    return (
      <div className="bg-[#070503] min-h-screen pt-[70px] font-dm">
        {/* Detail Hero Section */}
        <section className="relative h-[70vh] flex items-end px-6 md:px-[80px] pb-[80px] overflow-hidden">
          <div className="absolute inset-0 z-0">
             {(() => {
                const heroVideo = gallery.find(m => m.role === 'hero_video')?.url || event.videoUrl;
                const heroImg = gallery.find(m => m.role === 'hero_image' || m.role === 'cover')?.url || event.imageUrl;
                
                if (heroVideo) {
                   return <video 
                    autoPlay muted loop playsInline
                    className="w-full h-full object-cover opacity-40 blur-[2px]"
                    src={heroVideo.startsWith('http') ? heroVideo : `http://localhost:5000${heroVideo}`}
                   />;
                }
                if (heroImg) {
                   return <img 
                    src={heroImg.startsWith('http') ? heroImg : `http://localhost:5000${heroImg}`} 
                    className="w-full h-full object-cover opacity-40 blur-[2px]" 
                    alt="Hero"
                   />;
                }
                return <div className="absolute inset-0 bg-gradient-to-br from-[#1c0508] via-[#300a1c] to-[#0a1032]" />;
             })()}
             <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-[#070503]/20 to-transparent" />
          </div>

          <div className="relative z-10 w-full animate-hero-in">
             <button onClick={() => navigate('/events')} className="flex items-center gap-3 text-[10px] tracking-[4px] uppercase text-[#c9a84c]/60 mb-10 hover:text-[#c9a84c] transition-all">
                <ArrowLeft size={14} /> Back to Catalog
             </button>
             <div className="flex items-center gap-4 mb-4">
               <span className="text-[11px] font-bebas text-[#c9a84c] tracking-[4px] border-l-2 border-[#c9a84c] pl-4">Episode {event.episodeNum} — Transmission</span>
               {event.status === 'Sold Out' && <span className="bg-red-500/20 border border-red-500/40 text-red-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">Sold Out Show</span>}
             </div>
             <h1 className="font-playfair text-[clamp(48px,8vw,110px)] font-black text-white leading-[0.85] tracking-[-3px] uppercase mb-8">
                {event.name}
             </h1>
             <div className="flex flex-wrap items-center gap-8 text-[11px] tracking-[2px] uppercase text-white/50 font-bold">
                <span className="flex items-center gap-3"><Calendar size={14} className="text-[#c9a84c]" /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="flex items-center gap-3"><MapPin size={14} className="text-[#c9a84c]" /> {event.venue}</span>
                <span className="flex items-center gap-3"><Clock size={14} className="text-[#c9a84c]" /> Doors {event.time} Onwards</span>
             </div>
          </div>
        </section>

        {/* Dynamic Gallery & Content */}
        <div className="px-6 md:px-[80px] py-[100px] grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Info */}
          <div className="lg:col-span-12 space-y-24">
             {/* Large Production Gallery */}
             <div className="space-y-12">
                <div className="flex items-center justify-between">
                   <div>
                     <div className="flex items-center gap-3 text-[#c9a84c] text-[10px] tracking-[4px] uppercase mb-3 font-bold">
                        <Images size={14} /> Production Atmosphere
                     </div>
                     <h2 className="font-playfair text-4xl text-white italic">Captured Moments</h2>
                   </div>
                   <div className="hidden md:flex items-center gap-2">
                      <span className="text-[10px] tracking-[2px] text-[#7a6e5c] uppercase">{gallery.length} Transmission Nodes Hosted</span>
                   </div>
                </div>

                {gallery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {gallery.map((media, idx) => (
                        <div key={idx} className={`relative overflow-hidden group cursor-pointer border border-white/5 bg-white/[0.02] ${idx === 0 || idx === 4 ? 'md:col-span-2' : ''}`}>
                           {media.type === 'video' ? (
                              <div className="aspect-video relative">
                                 <video 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    src={media.url.startsWith('http') ? media.url : `http://localhost:5000${media.url}`}
                                    autoPlay muted loop playsInline
                                 />
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play size={40} className="text-[#c9a84c]" />
                                 </div>
                              </div>
                           ) : (
                              <img 
                                 src={media.url.startsWith('http') ? media.url : `http://localhost:5000${media.url}`} 
                                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 aspect-square"
                                 alt={`Gallery ${idx}`}
                              />
                           )}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                              <span className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-black">{media.role?.replace('_', ' ') || 'Atmosphere'}</span>
                           </div>
                        </div>
                     ))}
                  </div>
                ) : (
                  <div className="py-20 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-[#7a6e5c] gap-4">
                     <Disc size={48} className="text-white/5" />
                     <p className="text-[10px] tracking-[4px] uppercase">Atmosphere nodes haven't been synchronized yet.</p>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-10">
                   <div>
                      <h3 className="text-white text-[12px] font-bold uppercase tracking-[4px] mb-6 flex items-center gap-3">
                         <span className="w-8 h-[1px] bg-[#c9a84c]" /> Synopsis
                      </h3>
                      <p className="text-[#7a6e5c] text-[clamp(16px,2vw,20px)] leading-[1.8] italic font-cormorant border-l border-[#c9a84c]/30 pl-8">
                         {event.description || 'This production marks a unique chapter in our broadcast history, bringing together souls through the universal language of melody and atmosphere.'}
                      </p>
                   </div>
                   
                   {event.benefits && event.benefits.length > 0 && (
                      <div className="space-y-8">
                         <h3 className="text-white text-[12px] font-bold uppercase tracking-[4px] flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-[#c9a84c]" /> Privileges
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {event.benefits.map((b, i) => (
                             <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 group hover:border-[#c9a84c]/30 transition-all">
                                <CheckCircle size={16} className="text-[#c9a84c]" />
                                <span className="text-[10px] uppercase tracking-[2px] text-white/70">{b}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                   )}
                </div>

                <div className="card-premium space-y-10">
                   <div className="flex items-center justify-between pb-8 border-b border-white/5">
                      <div>
                         <h4 className="text-[10px] uppercase tracking-[3px] text-[#7a6e5c] mb-1">Transmission Cost</h4>
                         <p className="text-4xl font-bebas text-white tracking-widest leading-none">₹{event.price} <span className="text-xs text-[#7a6e5c]">/ Head</span></p>
                      </div>
                      <Ticket size={40} className="text-[#c9a84c]/20" />
                   </div>
                   
                   <div className="space-y-6">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-[#7a6e5c]">
                         <span>Security Clearance</span>
                         <span className="text-white font-bold">{isExpired ? 'CLOSED' : 'GRANTED'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-[#7a6e5c]">
                         <span>Protocol</span>
                         <span className="text-white font-bold">Pre-verified Node</span>
                      </div>
                      <div className="p-5 bg-black border border-[#c9a84c]/10 text-[10px] tracking-[1.5px] uppercase text-[#7a6e5c] leading-relaxed italic">
                         "Admission is secured upon verification of your transmission node. Strictly non-refundable post-validation."
                      </div>
                   </div>

                   {!isExpired && event.status !== 'Sold Out' && (
                     <button 
                      onClick={() => navigate(`/pay/${event._id}`)}
                      className="w-full btn-gold py-6 text-[12px] tracking-[5px]"
                     >
                        Secure Your Access
                     </button>
                   )}
                   {(isExpired || event.status === 'Sold Out') && (
                     <div className="w-full py-6 border border-red-500/20 bg-red-500/5 text-red-500 text-center text-[10px] font-black uppercase tracking-[5px]">
                        {isExpired ? 'Broadcasting Period Concluded' : 'Transmission At Capacity'}
                     </div>
                   )}
                </div>
             </div>

             {/* Patrons */}
             {event.sponsors && event.sponsors.length > 0 && (
                <div className="space-y-12">
                   <div className="text-center">
                      <div className="text-[10px] tracking-[4px] uppercase text-[#7a6e5c] mb-4">Patroned By</div>
                   </div>
                   <div className="flex flex-wrap items-center justify-center gap-16 opacity-30">
                      {event.sponsors.map((s, i) => (
                        <div key={i} className="flex flex-col items-center gap-3">
                           <img src={s.logoUrl} alt={s.name} className="h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                           <span className="text-[8px] uppercase tracking-widest font-bold">{s.name}</span>
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────
  const filteredEvents = events.filter(event => {
    const isPast = new Date(event.date) < new Date(new Date().setHours(0,0,0,0));
    const isSoldOut = event.status === 'Sold Out';

    if (activeFilter === 'Available') return !isPast; 
    if (activeFilter === 'Sold Out') return isSoldOut;
    if (activeFilter === 'Past') return isPast || event.status === 'Completed';
    return true; // All
  });

  return (
    <div className="bg-[#070503] pt-[70px]">
      {/* Page Hero */}
      <div className="relative h-[52vh] min-h-[340px] flex items-end px-6 md:px-[60px] pb-[60px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#130900] via-[#1c1005] to-[#080604]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-transparent to-transparent" />
        </div>
        <div className="relative z-10">
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-[14px] flex items-center gap-3 animate-hero-in">
             <Ticket size={12} /> Live Experiences
          </div>
          <h1 className="font-playfair text-[clamp(42px,6vw,82px)] font-black leading-[0.9] tracking-[-2px] text-white">
            Upcoming<br /><em className="text-[#c9a84c] not-italic italic">Events</em>
          </h1>
        </div>
      </div>

      <div className="py-[60px] px-6 md:px-[60px] pb-[100px]">
        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {['All', 'Available', 'Sold Out', 'Past'].map((f) => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)}
              className={`p-6 border text-[11px] font-bold uppercase tracking-[4px] transition-all duration-300 text-center ${
                activeFilter === f ? 'bg-[#c9a84c] text-[#070503] border-[#c9a84c]' : 'bg-white/[0.02] text-[#7a6e5c] border-white/10 hover:border-[#c9a84c]/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px]">
          {filteredEvents.length === 0 ? (
             <div className="col-span-full py-20 text-center text-[#7a6e5c] tracking-[4px] uppercase text-[10px] border border-white/5 bg-white/[0.02]">
                No transmissions matching your broadcast filter.
             </div>
          ) : filteredEvents.map((event, idx) => {
            const isExpired = new Date(event.date) < new Date(new Date().setHours(0,0,0,0));
            return (
              <div 
                key={event._id} 
                ref={addToRefs} 
                onClick={() => navigate(`/events/${event._id}`)}
                className="reveal col-span-1 relative group overflow-hidden min-h-[440px] flex items-end cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1c0508] via-[#300a1c] to-[#0a1032] flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                   {(() => {
                      const coverImg = event.media?.find(m => m.role === 'cover')?.url || event.imageUrl;
                      if (coverImg) return <img src={coverImg.startsWith('http') ? coverImg : `http://localhost:5000${coverImg}`} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-opacity" alt={event.name} />;
                      const gallery = (event.media || []).filter(m => m.type === 'image');
                      const randomImg = gallery.length > 0 ? gallery[idx % gallery.length].url : null;
                      if (randomImg) return <img src={randomImg.startsWith('http') ? randomImg : `http://localhost:5000${randomImg}`} className="w-full h-full object-cover opacity-20 group-hover:opacity-100 transition-opacity" alt={event.name} />;
                      return <div className="font-bebas text-[clamp(80px,15vw,180px)] text-[#c9a84c]/5 tracking-[-6px] leading-none uppercase">{event.name.split(' ')[0]}</div>;
                   })()}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                
                <div className="relative z-10 p-10 w-full font-dm">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${isExpired ? 'bg-red-500/20 border border-red-500/40 text-red-500' : 'bg-[#c9a84c] text-[#070503]'}`}>
                      <Circle size={6} fill="currentColor" /> {isExpired ? 'Concluded' : event.status === 'Active' ? 'Open Tonight' : event.status}
                    </span>
                    <span className="text-[10px] font-bebas text-[#c9a84c] tracking-[2px]">Ep.{event.episodeNum} — Production</span>
                  </div>
                  <h2 className="font-playfair text-[32px] md:text-[42px] font-bold leading-tight mb-2 text-white">{event.name}</h2>
                  <p className="text-[#c9a84c] text-[11px] tracking-[1.5px] uppercase mb-8">{event.venue} — {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  
                  <div className="flex items-center gap-6">
                     <button className="flex items-center gap-4 text-[#c9a84c] text-[9px] font-black uppercase tracking-[3px] group-hover:gap-6 transition-all">
                        Experience Full Production <ArrowRight size={14} />
                     </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
