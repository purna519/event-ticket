// ─── pages/EventPage.jsx ──────────────────────────────────────────────────────
// Landing page showing event details with unified poster layout.
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight, ShieldCheck, Ticket, Info, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import StepIndicator from '../components/StepIndicator';
import PublicLayout from '../components/PublicLayout';

export default function EventPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) setUser(JSON.parse(userData));

    api.get('/events/current').then((res) => {
      setEvent(res.data);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-10 h-10 border-[3px]" />
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Initialising Entry…</p>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="animate-slide-up">
        {/* Session Header */}
        <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <User size={18} className="text-white/40" />
            </div>
            {user ? (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Attendee</p>
                <p className="text-sm font-bold text-white">{user.name}</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Guest Access</p>
                <Link to="/login" className="text-sm font-bold text-white hover:underline transition-all">Sign In to Continue</Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/history" className="text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-white/60 hover:text-white">
                  My Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-3 bg-white/5 hover:bg-red-500/10 rounded-full border border-white/10 transition-all group"
                >
                  <LogOut size={16} className="text-white/40 group-hover:text-red-500 transition-colors" />
                </button>
              </>
            ) : (
              <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-all shadow-xl">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator current={0} />
        </div>

        {/* Mobile Poster (Shown only on small screens) */}
        <div className="block lg:hidden mb-12 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
          <img src="/poster.png" alt="Event" className="w-full h-auto" />
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block w-8 h-[1px] bg-white/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">THE MUSIC SOCIETY PRESENTS</p>
            </div>
            <h1 className="text-3xl md:text-8xl font-black text-white tracking-tighter uppercase whitespace-pre-line leading-[0.8] mb-6">
              {event.name}
            </h1>
            <p className="text-l md:text-1l font-black text-white/80 tracking-tight uppercase italic opacity-80 decoration-white/20">
              Sri Rama Navami Special -Bhajan Clubbing Inspired!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40">
                  <Calendar size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">DATE</p>
                  <p className="text-white font-bold leading-tight">{new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40">
                  <Clock size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">SCHEDULE</p>
                  <p className="text-white font-bold leading-tight">{event.time} Onwards</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40">
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">LOCATION</p>
                  {event.locationUrl ? (
                    <a
                      href={event.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-bold leading-tight hover:text-white/60 transition-colors underline decoration-white/10"
                    >
                      {event.venue}
                    </a>
                  ) : (
                    <p className="text-white font-bold leading-tight">{event.venue}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40">
                  <Ticket size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">PRICING</p>
                  <p className="text-white font-bold leading-tight">₹{event.price} / Person</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card !p-10 border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-6">
              <Info size={14} className="text-white/30" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Performance Notes</p>
            </div>
            <p className="text-white/60 text-sm leading-relaxed tracking-tight whitespace-pre-wrap font-medium">
              {event.description}
            </p>
          </div>

          {event.benefits && event.benefits.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-block w-4 h-[1px] bg-white/10" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">EVENT INCLUSIONS</p>
              </div>
              <div className="space-y-3">
                {event.benefits.map((ben, i) => (
                  <div key={i} className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-white/10 transition-all">
                        <Ticket size={16} strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
                        {ben}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.sponsors && event.sponsors.length > 0 && (
            <div className="space-y-8 pt-4">
              <div className="flex items-center gap-3">
                <span className="inline-block w-4 h-[1px] bg-white/10" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Supported By</p>
              </div>
              <div className="flex flex-wrap items-center gap-8 md:gap-12">
                {event.sponsors.map((s, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute -inset-4 bg-white/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                      src={s.logoUrl}
                      alt={s.name}
                      title={s.name}
                      className="h-8 md:h-12 w-auto object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sold Out Banner */}
          {event && event.totalCapacity <= event.reservedTickets && (
            <div className="mb-12 p-8 rounded-[2rem] bg-yellow-500/5 border border-yellow-500/20 text-center animate-pulse">
              <p className="text-yellow-500 text-sm font-black uppercase tracking-[0.2em] italic">
                🚀 Overwhelming Response!
              </p>
              <p className="text-white/60 text-[11px] mt-2 font-bold uppercase tracking-widest leading-relaxed">
                All tickets are currently sold out. thank you for the love!
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/pay')}
            disabled={event && event.totalCapacity <= event.reservedTickets}
            className={`btn-primary py-6 text-xs font-black uppercase tracking-[0.4em] group ${event && event.totalCapacity <= event.reservedTickets ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
          >
            {event && event.totalCapacity <= event.reservedTickets ? 'SOLD OUT - THANK YOU' : (
              <>Book Now <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" /></>
            )}
          </button>

          <p className="flex items-center justify-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
            <ShieldCheck size={14} /> End-to-End Encrypted Verification
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
