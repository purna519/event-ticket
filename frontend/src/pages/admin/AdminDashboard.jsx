import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Ticket, CheckCircle, Clock, XCircle, CreditCard, 
  Upload, Users, Settings2, RefreshCcw, QrCode, Scan,
  TrendingUp, Activity, BarChart3, ShieldCheck, 
  ArrowRight, Globe, Zap, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

// Rolling number component for premium feel
const RollingNumber = ({ value, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) return setDisplay(0);
    let totalDuration = 1500;
    let increment = Math.max(1, Math.floor(end / (totalDuration / 30)));
    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get('eventId') || localStorage.getItem('activeEventId');

  useEffect(() => {
    if (eventId) fetchStats();
  }, [eventId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/stats${eventId ? `?eventId=${eventId}` : ''}`);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await api.put('/admin/event', { eventId, status: newStatus });
      fetchStats();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const dashboardCards = stats ? [
    { icon: TrendingUp, label: 'Gross Revenue', value: stats.totalRevenue || 0, prefix: '₹', desc: 'Total Sales Volume', trend: '+12%', color: 'border-[#c9a84c]' },
    { icon: Activity, label: 'Entrance Flow', value: stats.scannedTickets || 0, desc: 'Verified Check-ins', trend: 'Live', color: 'border-green-500/50' },
    { icon: Users, label: 'Available Inventory', value: Math.max(0, (stats.totalCapacity || 150) - stats.reservedTickets), desc: 'Society Capacity', trend: 'Filling', color: 'border-[#7a6e5c]' },
    { icon: Ticket, label: 'Ledger Entries', value: stats.totalTickets || 0, desc: 'Verified Passes', trend: 'Validated', color: 'border-[#c9a84c]/30' },
  ] : [];

  return (
    <div className="space-y-12 pb-20 overflow-hidden">
      {/* Header / Mission Control */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#c9a84c]/10 pb-12"
      >
        <div>
          <div className="text-[10px] tracking-[5px] uppercase text-[#c9a84c] mb-3 font-bold flex items-center gap-3">
             <ShieldCheck size={14} /> Strategic Command Node
          </div>
          <h1 className="font-playfair text-[clamp(42px,5vw,84px)] font-black leading-[0.85] tracking-[-3px] text-white">
            Mission<br /><em className="text-[#c9a84c] not-italic italic">Control</em>
          </h1>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
            <div className="flex bg-[#c9a84c]/5 border border-[#c9a84c]/10 p-1 rounded-sm">
               {['Active', 'Draft', 'Sold Out'].map(s => (
                  <button 
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`px-4 py-2 text-[9px] font-bold uppercase tracking-[2px] transition-all ${
                        stats?.status === s ? 'bg-[#c9a84c] text-[#070503]' : 'text-[#7a6e5c] hover:text-[#c9a84c]'
                    }`}
                  >
                     {s}
                  </button>
               ))}
            </div>
            <button 
              onClick={fetchStats}
              className="p-4 border border-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#070503] transition-all group"
            >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            </button>
        </div>
      </motion.div>

      {loading && !stats ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-6">
           <div className="w-16 h-16 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full shadow-[0_0_50px_rgba(201,168,76,0.1)]" />
           <p className="text-[10px] tracking-[5px] uppercase text-[#c9a84c] animate-pulse">Syncing Neural Connection...</p>
        </div>
      ) : (
        <>
          {/* Real-Time Pulse Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((card, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className={`card-premium !p-8 border-l-4 ${card.color} group hover:border-[#c9a84c]/40 transition-all duration-500`}
              >
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 border border-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] transition-all group-hover:bg-[#c9a84c]/5 group-hover:scale-110">
                      <card.icon size={20} strokeWidth={1.5} />
                   </div>
                   <div className="text-[9px] font-black text-[#c9a84c] bg-[#c9a84c]/5 px-3 py-1 uppercase tracking-[2px] border border-[#c9a84c]/10">
                      {card.trend}
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[32px] font-playfair font-black text-white leading-none">
                      <RollingNumber value={card.value} prefix={card.prefix} />
                   </p>
                   <p className="text-[10px] tracking-[3px] uppercase text-[#c9a84c] font-black pt-2">{card.label}</p>
                   <p className="text-[9px] tracking-[2px] text-[#7a6e5c] uppercase mt-1">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Velocity Graph */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                className="lg:col-span-2 card-premium !p-10 space-y-12"
             >
                <div className="flex items-center justify-between">
                   <div>
                      <h3 className="font-playfair text-3xl font-black text-white uppercase tracking-tight">Sales Velocity</h3>
                      <p className="text-[10px] tracking-[4px] text-[#7a6e5c] uppercase">Daily Transmission Records</p>
                   </div>
                   <Zap size={24} className="text-[#c9a84c] animate-pulse" />
                </div>
                
                <div className="h-[280px] flex items-end justify-between gap-1 sm:gap-4 border-b border-[#c9a84c]/10 pb-4">
                   {(stats?.dailyStats || []).map((d, i) => (
                     <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                        <motion.div 
                          initial={{ height: 0 }} animate={{ height: `${Math.min(100, (d.count / (Math.max(...(stats.dailyStats.map(x => x.count))) || 1)) * 90 + 5)}%` }}
                          transition={{ duration: 1.5, delay: i * 0.05 + 0.5 }}
                          className="w-full bg-[#c9a84c]/10 group-hover:bg-[#c9a84c] transition-all duration-300 rounded-t-sm border-x border-t border-[#c9a84c]/20"
                        />
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-[#c9a84c] text-[#070503] px-3 py-1 text-[10px] font-black tracking-widest uppercase z-20 pointer-events-none whitespace-nowrap">
                            {d.count} Passes • {d._id.split('-').slice(2)}
                        </div>
                     </div>
                   ))}
                </div>
                <div className="flex justify-between px-2">
                   {(stats?.dailyStats || []).filter((_, i) => i % 2 === 0).map((d, i) => (
                      <span key={i} className="text-[9px] tracking-[3px] font-bold text-[#7a6e5c] uppercase">{d._id.split('-').slice(2)}</span>
                   ))}
                </div>
             </motion.div>

             {/* Registry Health / Stats Overview */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                className="card-premium !p-10 space-y-10"
             >
                <div className="flex items-center justify-between">
                   <div>
                      <h3 className="font-playfair text-3xl font-black text-white uppercase tracking-tight">System Node</h3>
                      <p className="text-[10px] tracking-[4px] text-[#7a6e5c] uppercase">Registry Health Protocol</p>
                   </div>
                   <Activity size={24} className="text-[#c9a84c]" />
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 bg-[#c9a84c]/[0.02] border border-[#c9a84c]/10">
                      <div className="flex items-center gap-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                         <span className="text-[11px] font-bold uppercase tracking-[2px] text-white">Verified Node</span>
                      </div>
                      <span className="text-white font-black text-lg">{stats?.verified || 0}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-[#c9a84c]/[0.02] border border-[#c9a84c]/10">
                      <div className="flex items-center gap-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#7a6e5c]" />
                         <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#7a6e5c]">Pending Flow</span>
                      </div>
                      <span className="text-white font-black text-lg">{stats?.pending || 0}</span>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10">
                      <div className="flex items-center gap-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                         <span className="text-[11px] font-bold uppercase tracking-[2px] text-red-500/50">Rejected Sync</span>
                      </div>
                      <span className="text-white font-black text-lg">{stats?.rejected || 0}</span>
                   </div>
                </div>

                <div className="pt-10 border-t border-[#c9a84c]/10">
                   <Link to="/admin/bookings" className="btn-gold !w-full !flex !items-center !justify-center gap-4 !py-5 tracking-[4px]">
                      View Global Ledger <ArrowRight size={16} />
                   </Link>
                </div>
             </motion.div>
          </div>

          {/* Rapid Command Center */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-10">
            {[
              { to: '/admin/box-office', icon: CreditCard, title: 'Box Office' },
              { to: '/admin/promos', icon: Ticket, title: 'Forging' },
              { to: '/admin/analytics', icon: BarChart3, title: 'Cognitives' },
              { to: '/admin/scanner', icon: Scan, title: 'Scanner' },
              { to: '/admin/bookings', icon: Users, title: 'Ledger' },
              { to: '/admin/event', icon: Settings2, title: 'Systems' },
            ].map(({ to, icon: Icon, title }, idx) => (
              <motion.div key={to} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + idx * 0.05 }}>
                <Link 
                  to={to} 
                  className="card-premium !p-8 flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-all duration-300"
                >
                  <Icon size={24} strokeWidth={1.5} className="text-[#7a6e5c] group-hover:text-[#c9a84c] transition-colors mb-4" />
                  <p className="text-white font-black text-[10px] uppercase tracking-[3px]">{title}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
