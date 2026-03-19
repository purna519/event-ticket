// ─── pages/admin/AdminLayout.jsx ──────────────────────────────────────────────
// Shared layout for all admin pages — sidebar nav + content area
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Ticket, Settings, LogOut, ExternalLink, QrCode, Users, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/scanner', label: 'Attendance', icon: QrCode },
  { to: '/admin/event', label: 'Event Settings', icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-950">
      {/* ── Mobile Header ─────────────────────────────────────────────────── */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-black border-b border-white/5 z-50">
        <h2 className="text-white font-black text-lg tracking-tighter">EVENT<span className="text-white/40">TKT</span></h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-0 z-40 lg:static lg:w-64 flex-shrink-0 bg-black border-r border-white/5 flex flex-col transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo (Hidden on mobile header if menu is open, but good for large screens) */}
        <div className="hidden lg:block px-8 py-8 border-b border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-1">Admin</p>
          <h2 className="text-white font-black text-xl tracking-tighter">EVENT<span className="text-white/40">TKT</span></h2>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold tracking-tight transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-black shadow-lg shadow-white/5'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-8 pt-4 space-y-2 border-t border-white/5 lg:border-none">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold text-white/30 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300"
          >
            <LogOut size={18} /> Logout
          </button>
          <a
            href="/"
            target="_blank"
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold text-white/20 hover:text-white/50 transition-all duration-300"
          >
            <ExternalLink size={18} /> View Event
          </a>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="page-container-wide py-8 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
