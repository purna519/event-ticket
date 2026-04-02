import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Play, ExternalLink } from 'lucide-react';
import api from '../api';

export default function Footer() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        // Sort by date chronological (oldest to newest) to assign fixed Episode Numbers
        const chrono = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const enriched = data.map(ev => ({
            ...ev,
            episodeNum: chrono.findIndex(c => c._id === ev._id) + 1
        }));
        // Sort display by newest first
        const newest = enriched.sort((a, b) => new Date(b.date) - new Date(a.date));
        setEvents(newest.slice(0, 4));
      } catch (err) {
        console.error('Footer fetch error:', err);
      }
    };
    fetchEvents();
  }, []);

  return (
    <>
      <footer className="bg-[#070503] border-t border-[#c9a84c]/10 pt-[72px] px-6 md:px-[60px] pb-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr] gap-14">
        {/* Brand */}
        <div className="sf-brand">
          <div className="flex items-center gap-[13px] mb-4">
            <div className="w-[38px] h-[38px] bg-[#c9a84c] flex items-center justify-center font-playfair font-black text-[14px] text-[#070503]">
              MS
            </div>
            <div className="logo-txt">
              <b className="block text-[11px] font-semibold tracking-[2.5px] uppercase text-[#f2ead8]">The Music Society</b>
              <small className="text-[9px] tracking-[3px] uppercase text-[#c9a84c]">Sing Along</small>
            </div>
          </div>
          <p className="text-[13px] text-[#7a6e5c] leading-[1.9] max-w-[240px]">
            Vijayawada's home for intimate live music experiences. No stage. No pressure. Just pure vibe.
          </p>
        </div>

        {/* Columns */}
        <div className="sf-col">
          <h5 className="text-[9px] tracking-[3px] uppercase text-[#c9a84c] mb-[22px]">Navigate</h5>
          <ul className="flex flex-col gap-[11px] list-none">
            <li><Link to="/" className="text-[13px] text-[#7a6e5c] hover:text-[#f2ead8] transition-colors">Home</Link></li>
            <li><Link to="/events" className="text-[13px] text-[#7a6e5c] hover:text-[#f2ead8] transition-colors">Events</Link></li>
            <li><Link to="/gallery" className="text-[13px] text-[#7a6e5c] hover:text-[#f2ead8] transition-colors">Gallery</Link></li>
            <li><Link to="/reviews" className="text-[13px] text-[#7a6e5c] hover:text-[#f2ead8] transition-colors">Reviews</Link></li>
            <li><Link to="/about" className="text-[13px] text-[#7a6e5c] hover:text-[#f2ead8] transition-colors">About Us</Link></li>
          </ul>
        </div>

        <div className="sf-col">
          <h5 className="text-[9px] tracking-[3px] uppercase text-[#c9a84c] mb-[22px]">Recent Productions</h5>
          <ul className="flex flex-col gap-[11px] list-none">
            {events.length > 0 ? (
              events.map((ev, idx) => (
                <li key={ev._id}>
                  <Link to={`/events/${ev._id || ev.slug}`} className="text-[13px] text-[#7a6e5c] hover:text-[#f2ead8] transition-colors">
                    Ep.{ev.episodeNum} &mdash; {ev.name.split('-')[0].split('—')[0].trim()}
                  </Link>
                </li>
              ))
            ) : (
              <li><span className="text-[13px] text-[#7a6e5c]/50">No productions yet</span></li>
            )}
            {events.length < 4 && (
              <li><span className="text-[13px] text-[#7a6e5c]/50">Coming Soon...</span></li>
            )}
          </ul>
        </div>

        <div className="sf-col">
          <h5 className="text-[9px] tracking-[3px] uppercase text-[#c9a84c] mb-[22px]">Connect</h5>
          <ul className="flex flex-col gap-[11px] list-none">
            <li>
                <a href="https://instagram.com/themusicsociety26" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13px] text-[#7a6e5c] hover:text-[#f2ead8] transition-colors">
                    <Instagram size={14} /> Instagram
                </a>
            </li>
            <li><Link to="/history" className="text-[13px] text-[#7a6e5c] hover:text-[#f2ead8] transition-colors">My Bookings</Link></li>
            <li><Link to="/login" className="text-[13px] text-[#7a6e5c] hover:text-[#f2ead8] transition-colors">Sign In</Link></li>
          </ul>
        </div>
      </footer>

      <div className="border-t border-[#c9a84c]/6 mt-[50px] py-5 px-6 md:px-[60px] flex flex-col md:row justify-between items-center gap-4 text-[11px] text-[#7a6e5c]">
        <span>&copy; {new Date().getFullYear()} The Music Society, Vijayawada</span>
        <strong className="text-[#c9a84c] tracking-[2px] font-bebas text-[13px uppercase]">No Stage. No Pressure. Just Music.</strong>
      </div>
    </>
  );
}
