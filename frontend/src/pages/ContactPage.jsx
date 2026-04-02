import React, { useEffect, useRef } from 'react';
import { Mail, MapPin, Instagram, Youtube, Phone, Send, Globe, Star } from 'lucide-react';

export default function ContactPage() {
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  };

  const handleSend = (e) => {
    e.preventDefault();
    alert('Message sent! We will get back to you soon.');
  };

  return (
    <div className="bg-[#070503] pt-[70px]">
      <div className="relative h-[52vh] min-h-[340px] flex items-end px-6 md:px-[60px] pb-[60px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#130910] via-[#1c1005] to-[#080604]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-transparent to-transparent" />
        </div>
        <div className="relative z-10">
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-[14px] flex items-center gap-3">
             <Mail size={12} /> Reach Out
          </div>
          <h1 className="font-playfair text-[clamp(42px,6vw,82px)] font-black leading-[0.9] tracking-[-2px] text-white">
            Contact<br /><em className="text-[#c9a84c] not-italic italic">Us</em>
          </h1>
        </div>
      </div>

      <div className="py-[60px] px-6 md:px-[60px] pb-[100px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-[88px]">
          {/* Details */}
          <div>
            <div ref={addToRefs} className="reveal mb-10">
               <div className="sec-tag text-[#c9a84c] text-[9px] tracking-[4px] uppercase mb-10">Our Details</div>
               
               <div className="space-y-10">
                  <div className="flex gap-5">
                     <div className="w-12 h-12 border border-[#c9a84c]/25 flex items-center justify-center text-[#c9a84c] flex-shrink-0">
                        <MapPin size={17} />
                     </div>
                     <div>
                        <div className="text-[9px] tracking-[3px] uppercase text-[#c9a84c] mb-2">Location</div>
                        <div className="text-[14px] text-[#f2ead8] leading-relaxed">Vijayawada, Andhra Pradesh<br />Multiple Venues Across the City</div>
                     </div>
                  </div>

                  <div className="flex gap-5">
                     <div className="w-12 h-12 border border-[#c9a84c]/25 flex items-center justify-center text-[#c9a84c] flex-shrink-0">
                        <Instagram size={17} />
                     </div>
                     <div>
                        <div className="text-[9px] tracking-[3px] uppercase text-[#c9a84c] mb-2">Instagram</div>
                        <a href="https://instagram.com/themusicsociety26" target="_blank" rel="noreferrer" className="text-[14px] text-[#f2ead8] hover:text-[#c9a84c] transition-colors">@themusicsociety26</a>
                     </div>
                  </div>

                  <div className="flex gap-5">
                     <div className="w-12 h-12 border border-[#c9a84c]/25 flex items-center justify-center text-[#c9a84c] flex-shrink-0">
                        <Globe size={17} />
                     </div>
                     <div>
                        <div className="text-[9px] tracking-[3px] uppercase text-[#c9a84c] mb-2">Website</div>
                        <div className="text-[14px] text-[#f2ead8]">themusicsociety.in</div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-3 mt-12">
                  {[Instagram, Youtube, Phone, Star].map((Icon, i) => (
                    <a key={i} href="#" className="w-[46px] h-[46px] border border-[#c9a84c]/15 flex items-center justify-center text-[#7a6e5c] hover:border-[#c9a84c] hover:text-[#c9a84c] hover:-translate-y-1 transition-all">
                      <Icon size={16} />
                    </a>
                  ))}
               </div>
            </div>
          </div>

          {/* Form */}
          <div>
             <div ref={addToRefs} className="reveal">
                <div className="sec-tag text-[#c9a84c] text-[9px] tracking-[4px] uppercase mb-10">Send a Message</div>
                <form onSubmit={handleSend} className="flex flex-col gap-[18px]">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
                      <div className="flex flex-col gap-2">
                         <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Name</label>
                         <input className="bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all" placeholder="Your name" required />
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Email</label>
                         <input className="bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all" type="email" placeholder="your@email.com" required />
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Subject</label>
                      <input className="bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all" placeholder="Event inquiry, collab, etc." required />
                   </div>
                   <div className="flex flex-col gap-2">
                      <label className="text-[9px] tracking-[2.5px] uppercase text-[#7a6e5c]">Message</label>
                      <textarea className="bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-[14px_16px] text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all min-h-[140px] resize-none" placeholder="Tell us what's on your mind..." required />
                   </div>
                   <button type="submit" className="btn-gold self-start mt-4 flex items-center gap-3">
                      <Send size={14} /> Send Message
                   </button>
                </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
