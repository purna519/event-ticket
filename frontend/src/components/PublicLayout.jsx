// ─── components/PublicLayout.jsx ──────────────────────────────────────────────
// Shared layout for all user-facing pages:
// Left: Sticky Event Poster
// Right: Dynamic Page Content
// ──────────────────────────────────────────────────────────────────────────────

import { ShieldCheck } from 'lucide-react';

export default function PublicLayout({ children, showSteps, currentStep }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        
        {/* ── Left: Sticky Poster (Desktop Only) ───────────────────────────── */}
        <div className="hidden lg:block sticky top-12 animate-fade-in group">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.03)] border border-white/5 bg-black">
            <img 
              src="/poster.png" 
              alt="Event Poster" 
              className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-out" 
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            {/* Branding on Poster */}
            <div className="absolute bottom-12 left-12 right-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-[1px] bg-white/20" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Exclusive Access</p>
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter uppercase whitespace-pre-line leading-none mb-4">
                SECURE<br /><span className="text-white/40">TICKETING</span>
              </h3>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20">
                <ShieldCheck size={12} /> SSL Encrypted Gateway
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Page Content ─────────────────────────────────────────── */}
        <div className="w-full">
          {children}
        </div>

      </div>
    </div>
  );
}
