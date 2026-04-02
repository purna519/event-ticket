import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, CircleDot, User, Heart, Handshake, Music } from 'lucide-react';
import navyaImg from './Assets/Navya founder 1.jpeg';
import api from '../api';

export default function AboutPage() {
   const [eventsCount, setEventsCount] = useState(0);
   const revealRefs = useRef([]);

   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
         { threshold: 0.1 }
      );
      revealRefs.current.forEach(ref => ref && observer.observe(ref));
      // Dynamic stats fetch
      api.get('/events').then(({ data }) => setEventsCount(data.length)).catch(() => { });

      return () => observer.disconnect();
   }, []);

   const addToRefs = (el) => {
      if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
   };

   return (
      <div className="bg-[#070503] pt-[70px]">
         {/* Page Hero */}
         <div className="relative h-[52vh] min-h-[340px] flex items-end px-6 md:px-[60px] pb-[60px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#130900] via-[#1c1005] to-[#080604]">
               <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-transparent to-transparent" />
            </div>
            <div className="relative z-10">
               <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-[14px] flex items-center gap-3 animate-fade-in">
                  <User size={12} /> Our Story
               </div>
               <h1 className="font-playfair text-[clamp(42px,6vw,82px)] font-black leading-[0.9] tracking-[-2px] text-white">
                  About<br /><em className="text-[#c9a84c] not-italic italic">Us</em>
               </h1>
            </div>
         </div>

         <div className="py-[60px] px-6 md:px-[60px] pb-[100px]">
            {/* Mission Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-[110px]">
               <div ref={addToRefs} className="reveal relative">
                  <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-[#1c0e05] via-[#0c1428] to-[#120920] p-10 flex flex-col items-center justify-center gap-4 text-center">
                     <div className="absolute top-5 left-5 w-7 h-7 border-t border-l border-[#c9a84c]/30" />
                     <div className="absolute top-5 right-5 w-7 h-7 border-t border-r border-[#c9a84c]/30" />
                     <div className="absolute bottom-5 left-5 w-7 h-7 border-b border-l border-[#c9a84c]/30" />
                     <div className="absolute bottom-5 right-5 w-7 h-7 border-b border-r border-[#c9a84c]/30" />

                     <div className="font-bebas text-[10px] tracking-[4px] text-[#7a6e5c]">Est. 2026</div>
                     <div className="font-bebas text-[66px] text-[#c9a84c]/15 leading-[0.9]">THE<br />MUSIC<br />SOCIETY.</div>
                     <div className="w-12 h-[1px] bg-[#c9a84c]/30" />
                     <p className="font-cormorant italic text-[16px] text-[#7a6e5c] leading-relaxed">Sing Along<br />Live Jam Sessions<br />Voices & Stories</p>
                  </div>
                  <div className="absolute -bottom-5 -right-5 w-[42%] aspect-square bg-[#c9a84c] border-[3px] border-[#070503] hidden sm:flex flex-col items-center justify-center gap-1">
                     <strong className="font-bebas text-[40px] text-[#070503] leading-none">{eventsCount || '3'}</strong>
                     <span className="text-[9px] tracking-[2px] uppercase text-[#070503]/60">Episodes</span>
                  </div>
               </div>

               <div>
                  <div ref={addToRefs} className="reveal">
                     <div className="sec-tag flex items-center gap-3 text-[#c9a84c] uppercase tracking-[4px] text-[10px] mb-6">
                        <CircleDot size={8} /> Our Mission
                     </div>
                     <h2 className="font-playfair text-[clamp(28px,4vw,48px)] font-bold leading-tight mb-7">
                        Where <em className="text-[#c9a84c] not-italic italic">Melody</em><br />Meets Community
                     </h2>
                     <blockquote className="border-l-[3px] border-[#c9a84c] pl-[30px] my-[38px] font-playfair italic text-[clamp(20px,2.8vw,36px)] leading-relaxed text-white">
                        "No stage. No pressure. Just voices, stories, and the music that lives between us."
                     </blockquote>
                     <p className="text-[15px] text-[#7a6e5c] leading-[1.95] mb-5">
                        The Music Society was born in Vijayawada with one simple belief — music shouldn't be performed at people, it should be lived with them. We create intimate, high-vibe musical experiences where everyone belongs, everyone sings, and everyone leaves transformed.
                     </p>
                     <div className="grid grid-cols-3 gap-[3px] mt-9">
                        {[
                           { v: eventsCount || '3', l: 'Episodes' },
                           { v: '100%', l: 'Sold Out' },
                           { v: 'VJA', l: 'Vijayawada' }
                        ].map((s, i) => (
                           <div key={i} className="bg-white/5 border border-white/5 p-[26px] text-center transition-all hover:border-[#c9a84c]/20">
                              <strong className="font-bebas text-[44px] text-[#c9a84c] block leading-none">{s.v}</strong>
                              <span className="text-[9px] tracking-[2px] uppercase text-[#7a6e5c] block mt-1">{s.l}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Founders Section */}
            <div className="mt-20">
               <div ref={addToRefs} className="reveal mb-12">
                  <div className="sec-tag flex items-center gap-3 text-[#c9a84c] uppercase tracking-[4px] text-[10px] mb-4">
                     <CircleDot size={8} /> The Founders
                  </div>
                  <h2 className="font-playfair text-[clamp(32px,4vw,58px)] font-bold leading-[1.08] tracking-[-1px]">
                     The <em className="text-[#c9a84c] not-italic italic">Faces</em> Behind<br />The Music
                  </h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px]">
                  {[
                     {
                        num: '01',
                        role: 'Co-Founder & Curator',
                        name: 'Navya Vinnakota',
                        image: navyaImg,
                        desc: 'The visionary behind the vibe. The one who decided Vijayawada deserved its own intimate music culture. Curates every episode from concept to the final note.',
                        tags: ['Curation', 'Vision', 'Events']
                     },
                     {
                        num: '02',
                        role: 'Co-Founder & Community Head',
                        name: 'John Vicc',
                        image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=600&auto=format&fit=crop',
                        desc: 'The heartbeat of the community. Ensures every attendee feels seen, welcomed, and part of something bigger. Builds the tribe one sing-along at a time.',
                        tags: ['Community', 'Warmth', 'Connection']
                     }
                  ].map((fc, i) => (
                     <div key={i} ref={addToRefs} className="reveal group bg-white/5 border border-white/5 relative overflow-hidden transition-all duration-400 hover:border-[#c9a84c]/30 flex flex-col">
                        <div className="h-[320px] w-full relative overflow-hidden">
                           <img src={fc.image} className="w-full h-full object-cover grayscale opacity-75 group-hover:opacity-100 group-hover:grayscale-[50%] transition-all duration-700 group-hover:scale-105" alt={fc.name} />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-[#070503]/20 to-transparent" />
                        </div>

                        <div className="p-[40px_46px] relative flex-1 bg-[#070503]">
                           <div className="absolute top-0 left-0 w-[3px] h-0 bg-[#c9a84c] transition-all duration-500 group-hover:h-full" />
                           <div className="font-bebas text-[82px] text-[#c9a84c]/5 leading-none absolute top-[-30px] right-5">{fc.num}</div>
                           <div className="text-[9px] tracking-[3.5px] uppercase text-[#c9a84c] mb-3">{fc.role}</div>
                           <h3 className="font-playfair text-[34px] font-bold mb-5">{fc.name}</h3>
                           <p className="text-[14px] text-[#7a6e5c] leading-[1.9] mb-6">{fc.desc}</p>
                           <div className="flex gap-2 flex-wrap">
                              {fc.tags.map(tag => (
                                 <span key={tag} className="text-[9px] tracking-[1.5px] uppercase p-[5px_12px] border border-[#c9a84c]/20 text-[#7a6e5c]">{tag}</span>
                              ))}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
