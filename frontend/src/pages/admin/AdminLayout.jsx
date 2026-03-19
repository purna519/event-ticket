// ─── pages/admin/AdminLayout.jsx ──────────────────────────────────────────────
// Shared layout for all admin pages — sidebar nav + content area
// ──────────────────────────────────────────────────────────────────────────────

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Ticket, Settings, LogOut, ExternalLink, QrCode, Users } from 'lucide-react';

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

  function handleLogout() {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex bg-neutral-950">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-black border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="px-8 py-8 border-b border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-1">Admin</p>
          <h2 className="text-white font-black text-xl tracking-tighter">EVENT<span className="text-white/40">TKT</span></h2>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
        <div className="px-4 pb-8 space-y-2">
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

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="page-container-wide">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
