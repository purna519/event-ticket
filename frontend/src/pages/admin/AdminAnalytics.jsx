import { useEffect, useState } from 'react';
import { 
  BarChart3, PieChart, Users, Globe, 
  ArrowUpRight, Download, Calendar, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/stats');
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportBookings = () => {
    window.open(`${api.defaults.baseURL}/admin/bookings/export`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-40 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full" />
        <p className="text-[10px] tracking-[4px] uppercase text-[#7a6e5c]">Synchronizing Neural Network...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3 font-bold flex items-center gap-3">
             <BarChart3 size={14} /> Cognitive Insights
          </div>
          <h1 className="font-playfair text-[clamp(42px,4vw,64px)] font-black leading-[0.9] tracking-[-2px] text-white">
            Audience<br /><em className="text-[#c9a84c] not-italic italic">Architect</em>
          </h1>
        </div>
        <button 
          onClick={exportBookings}
          className="btn-gold flex items-center gap-3"
        >
          <Download size={16} /> Download Full Ledger (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Traffic Sources */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
           className="card-premium !p-10 space-y-10"
         >
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="font-playfair text-2xl font-bold text-white uppercase tracking-tight">Traffic Vectors</h3>
                  <p className="text-[10px] tracking-[3px] text-[#7a6e5c] uppercase">Source Origin Distribution</p>
               </div>
               <Globe size={20} className="text-[#c9a84c]" />
            </div>

            <div className="space-y-6">
               {(data?.sourceStats || []).map((s, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between text-[10px] uppercase tracking-[2px] font-bold">
                        <span className="text-white">{s._id || 'Direct'}</span>
                        <span className="text-[#c9a84c]">{s.count} Node Points</span>
                     </div>
                     <div className="h-2 bg-[#c9a84c]/5 border border-[#c9a84c]/10 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${Math.min(100, (s.count / (data.totalBookings || 1)) * 100)}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-[#c9a84c]"
                        />
                     </div>
                  </div>
               ))}
            </div>
         </motion.div>

         {/* Audience Demographics */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="card-premium !p-10 space-y-10"
         >
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="font-playfair text-2xl font-bold text-white uppercase tracking-tight">Society Demographics</h3>
                  <p className="text-[10px] tracking-[3px] text-[#7a6e5c] uppercase">Identity Breakdown</p>
               </div>
               <PieChart size={20} className="text-[#c9a84c]" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-12">
               {/* Simplified Pie Chart (CSS based) */}
               <div className="relative w-40 h-40 rounded-full border border-[#c9a84c]/20 flex items-center justify-center">
                  <div className="text-center">
                     <p className="text-2xl font-playfair font-black text-white">{data?.genderStats?.reduce((s, g) => s + g.count, 0) || 0}</p>
                     <p className="text-[8px] uppercase tracking-widest text-[#7a6e5c]">Total Users</p>
                  </div>
                  {/* Decorative orbital ring */}
                  <div className="absolute inset-[-10px] border border-[#c9a84c]/5 rounded-full animate-pulse" />
               </div>

               <div className="flex-1 space-y-6 w-full">
                  {(data?.genderStats || []).map((g, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-[#c9a84c]/5 border border-[#c9a84c]/10">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                           <span className="text-[10px] uppercase font-bold tracking-[2px] text-white">{g._id || 'Unknown'}</span>
                        </div>
                        <span className="text-[12px] font-black text-[#c9a84c]">{g.count}</span>
                     </div>
                  ))}
               </div>
            </div>
         </motion.div>
      </div>

      {/* Daily Sales Chart (Detailed) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-premium !p-10"
      >
         <div className="flex items-center justify-between mb-12">
            <div>
               <h3 className="font-playfair text-3xl font-bold text-white uppercase tracking-tight">Temporal Velocity</h3>
               <p className="text-[10px] tracking-[4px] text-[#7a6e5c] uppercase">Real-time daily booking volume (Last 14 Days)</p>
            </div>
            <Calendar size={24} className="text-[#c9a84c]" />
         </div>

         <div className="h-[350px] flex items-end justify-between gap-1 sm:gap-4 border-b border-[#c9a84c]/10 pb-4">
            {(data?.dailyStats || []).map((d, i) => (
               <div key={i} className="flex-1 group relative flex flex-col items-center h-full justify-end">
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: `${Math.min(100, (d.count / (Math.max(...(data.dailyStats.map(x => x.count))) || 1)) * 90 + 5)}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="w-full bg-[#c9a84c]/10 group-hover:bg-[#c9a84c] transition-all duration-300 rounded-t-sm border-x border-t border-[#c9a84c]/20"
                  />
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#c9a84c] text-[#070503] px-3 py-1 text-[10px] font-black uppercase tracking-widest pointer-events-none z-10">
                     {d.count} Passes • {d._id.split('-').slice(1).join('/')}
                  </div>
               </div>
            ))}
         </div>
         <div className="flex justify-between mt-6 px-2">
            {(data?.dailyStats || []).filter((_, i) => i % 2 === 0).map((d, i) => (
                <span key={i} className="text-[9px] tracking-[3px] text-[#7a6e5c] uppercase font-bold">
                    {d._id.split('-').slice(2).join('/')}
                </span>
            ))}
         </div>
      </motion.div>
    </div>
  );
}
