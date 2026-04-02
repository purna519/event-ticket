import React, { useEffect, useState, useRef } from 'react';
import { 
  Image as ImageIcon, Search, Play, Music, Sparkles, Disc, Mic, 
  Headphones, Star, X, Maximize2, Filter, ChevronRight, LayoutGrid,
  Video as VideoIcon, Camera
} from 'lucide-react';
import api from '../api';

export default function GalleryPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [displayMedia, setDisplayMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const revealRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/events');
        // Enrich events with episode numbers by date
        const chrono = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const enriched = data.map(ev => ({
            ...ev,
            episodeNum: chrono.findIndex(c => c._id === ev._id) + 1
        }));
        setEvents(enriched);
      } catch (err) {
        console.error('Gallery fetch fail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (events.length === 0) return;

    // Flatten all media from all events
    const allMedia = events.flatMap(ev => 
      (ev.media || []).map(m => ({ 
        ...m, 
        episodeNum: ev.episodeNum, 
        eventName: ev.name,
        eventId: ev._id 
      }))
    );

    let filtered = [];
    if (activeFilter === 'All') {
       const episodes = Array.from(new Set(allMedia.map(m => m.episodeNum))).sort((a, b) => a - b);
       episodes.forEach(epNum => {
          const epMedia = allMedia.filter(m => m.episodeNum === epNum);
          const photos = epMedia.filter(m => m.type === 'image');
          const vids = epMedia.filter(m => m.type === 'video');
          
          // Randomly pick 2 photos and 1 video per episode
          const randomPhotos = [...photos].sort(() => 0.5 - Math.random()).slice(0, 2);
          const randomVid = [...vids].sort(() => 0.5 - Math.random()).slice(0, 1);
          
          filtered.push(...randomPhotos, ...randomVid);
       });
       // Shuffle the mixed results so episodes aren't strictly blocked
       filtered.sort(() => 0.5 - Math.random());
    } else if (activeFilter === 'Videos') {
       filtered = allMedia.filter(m => m.type === 'video');
    } else {
       const targetEp = parseInt(activeFilter.replace('Episode ', ''));
       filtered = allMedia.filter(m => m.episodeNum === targetEp);
    }

    setDisplayMedia(filtered);
  }, [events, activeFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [displayMedia]);

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

  const filters = ['All', ...events.map(e => `Episode ${e.episodeNum}`).sort(), 'Videos'];

  return (
    <div className="bg-[#070503] min-h-screen pt-[70px]">
      {/* Page Hero */}
      <div className="relative h-[45vh] min-h-[300px] flex items-end px-6 md:px-[80px] pb-[60px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#100805] via-[#050810] to-[#080604]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="text-[10px] tracking-[5px] uppercase text-[#c9a84c] mb-[18px] flex items-center gap-3 animate-hero-in">
             <ImageIcon size={12} /> Production Archives
          </div>
          <h1 className="font-playfair text-[clamp(42px,6vw,82px)] font-black leading-[0.9] tracking-[-2px] text-white">
            Gallery &<br /><em className="text-[#c9a84c] not-italic italic">Memories</em>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-[80px] py-[80px] pb-[120px]">
        {/* Filters */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-16 border-b border-white/5 pb-10">
          {filters.map((f) => (
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

        {/* Dynamic Items */}
        {displayMedia.length === 0 ? (
           <div className="py-40 text-center text-white/20 uppercase tracking-[5px] font-bebas text-2xl border border-dashed border-white/5 rounded-3xl">
              No Transmission Artifacts found for this selection.
           </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {displayMedia.map((item, i) => (
              <div 
                key={`${item.eventId}-${i}`} 
                ref={addToRefs} 
                onClick={() => setSelectedMedia(item)}
                className="reveal relative group cursor-auto break-inside-avoid overflow-hidden border border-white/5 bg-white/[0.02] rounded-xl hover:border-[#c9a84c]/30 transition-all duration-500"
              >
                {item.type === 'video' ? (
                   <div className="relative">
                      <video 
                        className="w-full h-auto object-cover"
                        src={item.url.startsWith('http') ? item.url : `http://localhost:5000${item.url}`}
                        autoPlay muted loop playsInline
                      />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10">
                        <VideoIcon size={14} className="text-[#c9a84c]" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Play size={40} className="text-[#c9a84c]" />
                      </div>
                   </div>
                ) : (
                   <div className="relative">
                      <img 
                        src={item.url.startsWith('http') ? item.url : `http://localhost:5000${item.url}`} 
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                        alt="Moment" 
                      />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10">
                        <ImageIcon size={14} className="text-[#c9a84c]" />
                      </div>
                   </div>
                )}
                
                {/* Meta Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                   <div className="text-[10px] uppercase font-bebas text-[#c9a84c] tracking-[2px] mb-1">Episode {item.episodeNum} — Transmission</div>
                   <div className="text-white text-[12px] font-black uppercase tracking-[1.5px] line-clamp-1">{item.eventName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Full-screen View */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 md:p-12 animate-in fade-in transition-all"
          onClick={() => setSelectedMedia(null)}
        >
           <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} />
           </button>
           
           <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center gap-10" onClick={e => e.stopPropagation()}>
              <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-[#c9a84c]/5">
                 {selectedMedia.type === 'video' ? (
                    <video 
                      className="max-h-full w-auto"
                      src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://localhost:5000${selectedMedia.url}`}
                      controls autoPlay
                    />
                 ) : (
                    <img 
                      src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://localhost:5000${selectedMedia.url}`}
                      className="max-h-full w-auto object-contain"
                      alt="Lightbox Moment"
                    />
                 )}
              </div>
              
              <div className="w-full text-center">
                 <div className="text-[12px] tracking-[5px] uppercase text-[#c9a84c] mb-2 font-bebas">Transmission Captured • Episode {selectedMedia.episodeNum}</div>
                 <h2 className="text-white text-3xl font-playfair italic">{selectedMedia.eventName}</h2>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
