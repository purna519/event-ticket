import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CreditCard, Ticket, Settings, 
  LogOut, ExternalLink, QrCode, Users, Menu, X, ShieldCheck, BarChart3,
  ChevronDown, Music, Plus
} from 'lucide-react';
import api from '../../api';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/studio', label: 'The Studio', icon: Music },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/promos', label: 'Promo Codes', icon: Ticket },
  { to: '/admin/box-office', label: 'Box Office', icon: CreditCard },
  { to: '/admin/bookings', label: 'Bookings', icon: Users },
  { to: '/admin/payments', label: 'Bank Ledger', icon: ShieldCheck },
  { to: '/admin/scanner', label: 'Entrance Node', icon: QrCode },
  { to: '/admin/event', label: 'Event Controls', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(localStorage.getItem('activeEventId') || '');
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/events');
            setEvents(data);
            // Auto-select first active event if none saved
            const saved = localStorage.getItem('activeEventId');
            if (!saved && data.length > 0) {
                const firstId = data[0]._id;
                setSelectedEventId(firstId);
                localStorage.setItem('activeEventId', firstId);
            }
        } catch (err) {
            console.error('Failed to load events:', err);
        } finally {
            setLoading(false);
        }
    };
    fetchEvents();
  }, []); // Only on mount

  function handleEventChange(id) {
    setSelectedEventId(id);
    localStorage.setItem('activeEventId', id);
    setIsSwitcherOpen(false);
    // Navigate to current page with new event context
    const currentPath = window.location.pathname;
    navigate(`${currentPath}?eventId=${id}`);
  }

  const activeEvent = events.find(e => e._id === selectedEventId);

  function handleLogout() {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#070503] font-dm selection:bg-[#c9a84c]/30">
      
      {/* ── Mobile Header ─────────────────────────────────────────────────── */}
      <header className="lg:hidden flex items-center justify-between px-6 py-5 bg-[#070503] border-b border-[#c9a84c]/10 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#c9a84c] flex items-center justify-center font-playfair font-black text-[12px] text-[#070503]">
            MS
          </div>
          <span className="text-white font-playfair font-black tracking-tight uppercase text-sm">Society Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-0 z-40 lg:static lg:w-72 flex-shrink-0 bg-[#070503] border-r border-[#c9a84c]/10 flex flex-col transition-transform duration-500
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Branding */}
        <div className="hidden lg:block px-10 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-[#c9a84c] flex items-center justify-center font-playfair font-black text-[14px] text-[#070503]">
              MS
            </div>
            <div>
              <p className="text-[9px] text-[#c9a84c] uppercase tracking-[0.4em] font-black leading-none">The Music</p>
              <h2 className="text-white font-playfair font-black text-lg tracking-tight uppercase leading-tight">Society</h2>
            </div>
          </div>
        </div>

        {/* Event Switcher */}
        <div className="px-6 mb-6">
           <div className="relative">
              <button 
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#c9a84c]/5 border border-[#c9a84c]/10 rounded-xl text-[10px] font-bold uppercase tracking-[2px] text-white hover:border-[#c9a84c]/30 transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                   <span className="truncate">{activeEvent ? activeEvent.name : 'Select Event'}</span>
                </div>
                <ChevronDown size={14} className={`text-[#c9a84c] transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSwitcherOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e0a05] border border-[#c9a84c]/10 rounded-xl overflow-hidden shadow-2xl z-50">
                   {events.map((e) => (
                      <button
                        key={e._id}
                        onClick={() => handleEventChange(e._id)}
                        className={`w-full text-left px-5 py-4 text-[9px] font-bold uppercase tracking-widest transition-all border-b border-[#c9a84c]/5 last:border-0 flex items-center justify-between ${
                           selectedEventId === e._id ? 'bg-[#c9a84c] text-[#070503]' : 'text-[#7a6e5c] hover:text-[#c9a84c] hover:bg-[#c9a84c]/5'
                        }`}
                      >
                         <span className="truncate max-w-[140px]">{e.name}</span>
                         <span className={`px-2 py-0.5 border text-[7px] font-black ${
                            e.status === 'Active' ? 'border-green-500/20 text-green-500' : 
                            e.status === 'Completed' || e.isArchived ? 'border-red-500/20 text-red-500' : 'border-[#7a6e5c]/20 text-[#7a6e5c]'
                         }`}>
                            {e.isArchived ? 'Archived' : e.status}
                         </span>
                      </button>
                   ))}
                   {/* Add Event Button */}
                   <button
                     onClick={() => {
                        localStorage.removeItem('activeEventId');
                        setSelectedEventId('');
                        setIsSwitcherOpen(false);
                        navigate('/admin/event?new=true');
                     }}
                     className="w-full text-left px-5 py-4 text-[9px] font-black uppercase tracking-[3px] text-[#c9a84c] bg-[#c9a84c]/5 hover:bg-[#c9a84c]/10 flex items-center gap-3 transition-all"
                   >
                      <Plus size={14} /> Add New EVENT
                   </button>
                </div>
              )}
           </div>
        </div>
        <div className="h-[1px] mx-10 bg-[#c9a84c]/10 mb-6" />

        {/* Navigation */}
        <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] tracking-[3.5px] uppercase text-[#7a6e5c] px-4 mb-6 font-bold">Management Menu</div>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-xl text-[11px] font-bold tracking-[2px] uppercase transition-all duration-400 group ${
                  isActive
                    ? 'bg-[#c9a84c] text-[#070503] shadow-[0_10px_30px_rgba(201,168,76,0.15)]'
                    : 'text-[#7a6e5c] hover:text-[#c9a84c] hover:bg-[#c9a84c]/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} className={`${isActive ? 'text-[#070503]' : 'text-[#c9a84c]/40 group-hover:text-[#c9a84c]'}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Area */}
        <div className="p-6 mt-auto">
          <div className="bg-[#c9a84c]/[0.03] border border-[#c9a84c]/10 rounded-2xl p-6 mb-4">
             <div className="flex items-center gap-3 text-[#c9a84c] text-[10px] tracking-[2px] uppercase font-bold mb-2">
                <ShieldCheck size={14} /> Secured Node
             </div>
             <p className="text-[9px] text-[#7a6e5c] uppercase tracking-widest leading-relaxed">
               Admin ID: TMS-001<br />
               Vijayawada Instance
             </p>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[2px] text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300"
            >
              Logout <LogOut size={14} />
            </button>
            <a
              href="/"
              className="w-full flex items-center justify-between px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[2px] text-[#7a6e5c] hover:text-[#c9a84c] transition-all duration-300"
            >
              View Public Site <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.03)_0%,transparent_50%)]">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
