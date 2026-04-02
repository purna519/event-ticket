import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Ticket, Play, ChevronDown, Disc, Mic, Headphones, Guitar, Piano, Drum, AudioLines } from 'lucide-react';

const ICONS = [Guitar, Piano, Drum, AudioLines, Music, Disc, Mic, Headphones];

export default function HeroSection({ featuredEvent }) {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#070503]">
        <img src="/hero_gold_guitar.jpg" alt="Music Society Vibe" className="absolute inset-0 w-full h-full object-cover opacity-[0.20] scale-105 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070503] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#070503]/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.08)_0%,transparent_60%)]" />
      </div>

      {/* Floating Instrument Icons */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(8)].map((_, i) => {
          const Icon = ICONS[i % 8];
          const size = 20 + (i % 3) * 16;
          const isLeft = i % 2 === 0;
          return (
            <div
              key={i}
              className="absolute text-[#c9a84c]/15 select-none animate-float"
              style={{
                top: `${15 + (i * 15) % 80}%`,
                left: `${isLeft ? 2 + (i * 5) % 15 : 82 + (i * 5) % 15}%`,
                fontSize: `${size}px`,
                animationDelay: `${(i * 0.8) % 5}s`,
                animationDuration: `${5 + (i % 4) * 2}s`
              }}
            >
              <Icon size={size} />
            </div>
          );
        })}
      </div>

      {/* Vinyl Animation */}
      <div className="absolute right-[-160px] top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
        <div className="w-[760px] h-[760px] animate-vinyl relative">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-[#c9a84c]/15" style={{ inset: `${i * 55}px` }} />
          ))}
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 text-center max-w-[1000px] px-10">
        <div className="inline-flex items-center gap-3 text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-8 animate-hero-in [animation-delay:300ms] opacity-0">
          <span className="w-10 h-[1px] bg-[#c9a84c]/50" />
          <Music size={10} />
          {featuredEvent ? `Ep.${featuredEvent.episodeNum} — ${featuredEvent.name}` : 'The Music Society — Live Production'}
          <Music size={10} />
          <span className="w-10 h-[1px] bg-[#c9a84c]/50" />
        </div>

        <h1 className="font-playfair text-[clamp(64px,10vw,140px)] font-black leading-[0.86] tracking-[-4px] mb-6 animate-hero-in [animation-delay:500ms] opacity-0 uppercase">
          MUSIC<br />
          <em className="text-[#c9a84c] not-italic italic">SOCIETY</em>
        </h1>

        <p className="font-cormorant italic text-[clamp(16px,2vw,22px)] font-light text-white/50 leading-[1.85] max-w-[520px] mx-auto mb-[54px] animate-hero-in [animation-delay:700ms] opacity-0">
          Sing along
        </p>

        <div className="flex gap-[18px] justify-center flex-wrap animate-hero-in [animation-delay:900ms] opacity-0">
          {featuredEvent ? (
            <button onClick={() => navigate(`/pay/${featuredEvent._id}`)} className="btn-gold">
              <Ticket size={14} className="inline mr-2" /> Book Your Pass
            </button>
          ) : (
            <Link to="/events" className="btn-gold">
              <Ticket size={14} className="inline mr-2" /> Explore Events
            </Link>
          )}
          <Link to="/gallery" className="btn-ghost">
            <Play size={14} className="inline mr-2" /> Watch Moments
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
        <span className="text-[10px] tracking-[3px] uppercase text-white/20">Scroll</span>
        <ChevronDown size={14} className="text-white/20" />
      </div>
    </section>
  );
}
