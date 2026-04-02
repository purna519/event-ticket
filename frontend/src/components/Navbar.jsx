import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, User, LogOut, CalendarCheck, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isSolid, setIsSolid] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobMenuOpen, setIsMobMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) setUser(JSON.parse(userData));

    const handleScroll = () => {
      setIsSolid(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav 
        id="nav"
        className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between transition-all duration-400 px-6 md:px-[60px] ${
          isSolid ? 'h-[62px] bg-[#070503]/95 backdrop-blur-[28px] border-b border-[#c9a84c]/10' : 'h-[70px] bg-transparent border-b border-transparent'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-[13px] no-underline group">
          <div className="w-[38px] h-[38px] bg-[#c9a84c] flex items-center justify-center font-playfair font-black text-[14px] text-[#070503]">
            MS
          </div>
          <div className="logo-txt">
            <b className="block text-[11px] font-semibold tracking-[2.5px] uppercase text-[#f2ead8]">The Music Society</b>
            <small className="text-[9px] tracking-[3px] uppercase text-[#c9a84c]">Sing Along</small>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex gap-[38px] list-none">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-[10px] tracking-[2.2px] uppercase font-medium no-underline relative pb-1 transition-colors duration-300 ${
                  location.pathname === link.path ? 'text-[#f2ead8]' : 'text-[#f2ead8]/60 hover:text-[#f2ead8]'
                }`}
              >
                {link.name}
                <span 
                  className={`absolute bottom-0 left-0 h-[1px] bg-[#c9a84c] transition-all duration-350 ${
                    location.pathname === link.path ? 'w-full' : 'w-0 hover:w-full'
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/events')}
            className="hidden sm:flex items-center gap-2 bg-[#c9a84c] text-[#070503] px-6 py-[10px] text-[10px] tracking-[2px] uppercase font-bold transition-all hover:bg-[#e8c96a] hover:-translate-y-[1px]"
          >
            <Ticket size={14} /> Book Tickets
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-[6px] text-[#f2ead8]/55 hover:text-[#c9a84c] transition-colors"
            >
              <User size={20} />
            </button>

            {isProfileOpen && (
              <div 
                className="absolute top-[calc(100%+16px)] right-0 bg-[#131009] border border-[#c9a84c]/18 min-w-[220px] shadow-2xl animate-slide-up"
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <div className="p-[20px_22px_14px] border-b border-[#c9a84c]/10">
                  <div className="text-[13px] font-semibold mb-1">{user ? user.name : 'Music Lover'}</div>
                  <div className="text-[9px] tracking-[2.5px] uppercase text-[#c9a84c]">{user?.role === 'admin' ? 'Curator' : 'Member'}</div>
                </div>
                
                {user?.role === 'admin' && (
                   <Link to="/admin" className="flex items-center gap-3 px-[22px] py-[13px] text-[12px] text-[#f2ead8]/65 hover:bg-[#c9a84c]/10 hover:text-[#f2ead8] transition-all">
                    <LayoutDashboard size={14} className="text-[#c9a84c]" /> Admin Panel
                  </Link>
                )}

                <Link to="/history" className="flex items-center gap-3 px-[22px] py-[13px] text-[12px] text-[#f2ead8]/65 hover:bg-[#c9a84c]/10 hover:text-[#f2ead8] transition-all">
                  <CalendarCheck size={14} className="text-[#c9a84c]" /> My Bookings
                </Link>

                {user && (
                   <Link to="/profile" className="flex items-center gap-3 px-[22px] py-[13px] text-[12px] text-[#f2ead8]/65 hover:bg-[#c9a84c]/10 hover:text-[#f2ead8] transition-all">
                     <User size={14} className="text-[#c9a84c]" /> Account Info
                   </Link>
                )}

                <div className="h-[1px] bg-[#c9a84c]/10 my-1" />

                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-[22px] py-[13px] text-[12px] text-red-500/65 hover:bg-red-500/10 hover:text-red-500 transition-all text-left"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                ) : (
                  <Link to="/login" className="flex items-center gap-3 px-[22px] py-[13px] text-[12px] text-[#f2ead8]/65 hover:bg-[#c9a84c]/10 hover:text-[#f2ead8] transition-all">
                    <LogOut size={14} className="text-[#c9a84c]" /> Sign In / Register
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mob Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-[#f2ead8]/65"
            onClick={() => setIsMobMenuOpen(!isMobMenuOpen)}
          >
            {isMobMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobMenuOpen && (
        <div className="fixed top-[62px] left-0 right-0 bg-[#070503]/97 backdrop-blur-[24px] border-b border-[#c9a84c]/10 z-[999] p-[28px_32px] lg:hidden animate-slide-down">
          <ul className="flex flex-col gap-[18px] list-none">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path}
                  onClick={() => setIsMobMenuOpen(false)}
                  className="text-[13px] tracking-[2px] uppercase text-[#f2ead8]/70 no-underline"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="pt-4 border-t border-white/5">
               <button 
                onClick={() => { navigate('/events'); setIsMobMenuOpen(false); }}
                className="w-full bg-[#c9a84c] text-[#070503] py-4 text-[11px] tracking-[2px] uppercase font-bold"
              >
                Book Tickets
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
