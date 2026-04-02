// ─── pages/admin/AdminScanner.jsx ──────────────────────────────────────────────
// Live QR Scanner + Entry Metrics + Searchable Registry
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  ShieldCheck, User, QrCode, CheckCircle, 
  XCircle, Clock, Smartphone, ChevronRight, 
  RefreshCcw, AlertTriangle, Fingerprint, 
  Verified, Users, Search, Activity, SearchIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

export default function AdminScanner() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ scannedTickets: 0, totalTickets: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const scannerRef = useRef(null);

  useEffect(() => {
    fetchStats();
    if (isScanning && !scannerRef.current) {
        initScanner();
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Unmount clear fail", err));
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats({ scannedTickets: data.scannedTickets, totalTickets: data.totalTickets });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
       const { data } = await api.get('/admin/bookings');
       const filtered = data.filter(b => 
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.phone.includes(searchQuery) ||
          (b.utr && b.utr.includes(searchQuery.toUpperCase()))
       );
       setSearchResults(filtered);
    } catch (err) {
       console.error(err);
    } finally {
       setLoading(false);
    }
  };

  function initScanner() {
     const scanner = new Html5QrcodeScanner('reader', {
      fps: 20,
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
    });
    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;
  }

  async function onScanSuccess(decodedText) {
    if (loading || !isScanning) return;
    setIsScanning(false);
    if (scannerRef.current) {
        await scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
    }
    verifyTicket(decodedText);
  }

  async function verifyTicket(ticketId) {
    const ticketIdClean = ticketId?.trim();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const { data } = await api.post('/admin/verify-ticket', { ticketId: ticketIdClean });
      setResult(data);
      // Add to recent scans if it's a new identifier
      if (!recentScans.find(s => s.ticketId === data.ticketId)) {
         setRecentScans(prev => [{
            holder: data.holder,
            ticketId: data.ticketId,
            time: new Date().toLocaleTimeString(),
            quantity: data.quantity
         }, ...prev].slice(0, 5));
      }
    } catch (err) {
      setError({ msg: err.response?.data?.error || 'Invalid Identity Signature' });
    } finally {
      setLoading(false);
    }
  }

  function onScanFailure(error) {}

  const handleNextScan = () => {
     setResult(null);
     setError(null);
     setIsScanning(true);
     fetchStats();
  };

  const checkIn = async (id, ticketIds) => {
    try {
      await api.post(`/admin/bookings/${id}/check-in`, { ticketIds });
      fetchStats();
      if (result) {
          setResult({ ...result, successMessage: 'Access Granted' });
      } else {
          alert('Check-in Successful');
          handleSearch();
      }
    } catch (err) {
       alert('Check-in Failed');
    }
  };

  const entryProgress = Math.min(100, (stats.scannedTickets / (stats.totalTickets || 1)) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      {/* Metrics Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#c9a84c]/[0.03] border border-[#c9a84c]/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-8"
      >
        <div className="space-y-4 flex-1 w-full">
           <div className="flex justify-between items-end mb-2">
              <div>
                 <p className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] font-black">Identity Registry</p>
                 <h2 className="text-white font-playfair text-3xl font-black">{stats.scannedTickets} <span className="text-[#7a6e5c] text-[14px]">/ {stats.totalTickets} Ingressed</span></h2>
              </div>
              <div className="text-right">
                 <p className="text-[#c9a84c] font-black text-xl">{entryProgress.toFixed(1)}%</p>
                 <p className="text-[8px] tracking-widest text-[#7a6e5c] uppercase">Node Density</p>
              </div>
           </div>
           <div className="h-1 bg-white/5 relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${entryProgress}%` }}
                className="h-full bg-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.5)]"
              />
           </div>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setShowSearch(!showSearch)}
                className={`p-5 border transition-all ${showSearch ? 'bg-[#c9a84c] text-[#070503] border-[#c9a84c]' : 'border-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/5'}`}
            >
                {showSearch ? <QrCode size={20} /> : <Search size={20} />}
            </button>
            <button onClick={fetchStats} className="p-5 border border-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-all">
                <RefreshCcw size={20} />
            </button>
        </div>
      </motion.div>

      <div className="space-y-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {showSearch ? (
            <motion.div 
              key="search" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
               <div className="flex gap-4">
                  <div className="relative flex-1">
                     <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7a6e5c]" size={18} />
                     <input 
                       className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-5 pl-14 text-white uppercase tracking-widest text-[12px] outline-none focus:border-[#c9a84c]"
                       placeholder="Locate Identity Metadata..."
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleSearch()}
                     />
                  </div>
                  <button onClick={handleSearch} className="btn-gold !py-5 px-10">Search</button>
               </div>

               <div className="space-y-3">
                  {searchResults.map((b, i) => (
                    <motion.div 
                      key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="bg-[#c9a84c]/[0.02] border border-[#c9a84c]/10 p-6 flex items-center justify-between group hover:border-[#c9a84c]/40 transition-all"
                    >
                       <div className="flex items-center gap-5">
                          <User size={20} className="text-[#c9a84c]/40" />
                          <div>
                             <h4 className="text-white font-bold uppercase tracking-widest text-xs">{b.name}</h4>
                             <p className="text-[9px] text-[#7a6e5c] uppercase tracking-[2px]">{b.quantity} Pax • {b.phone}</p>
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => verifyTicket(b.tickets[0].ticketId)}
                         className="px-6 py-3 border border-[#c9a84c]/20 text-[#c9a84c] text-[9px] font-black tracking-widest uppercase hover:bg-[#c9a84c] hover:text-[#070503] transition-all"
                       >
                          Open Node
                       </button>
                    </motion.div>
                  ))}
               </div>
            </motion.div>
          ) : isScanning ? (
            <motion.div 
              key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="border border-[#c9a84c]/20 p-2 bg-black/40 relative overflow-hidden backdrop-blur-2xl">
                  {/* Scan Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#c9a84c] z-10" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#c9a84c] z-10" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#c9a84c] z-10" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#c9a84c] z-10" />
                  
                  <div id="reader" className="w-full h-auto rounded-lg overflow-hidden grayscale contrast-125" />
                  
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#c9a84c]/40 shadow-[0_0_15px_#c9a84c] animate-scan-line pointer-events-none" />
              </div>

              <div className="mt-6 flex items-center gap-4 text-[#7a6e5c] text-[10px] tracking-[3px] uppercase justify-center">
                 <ShieldCheck size={14} className="text-[#c9a84c]" /> Scanned Identities are Encrypted
              </div>
            </motion.div>
          ) : result ? (
            <motion.div 
              key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="border border-[#c9a84c]/20 bg-[#c9a84c]/[0.02] overflow-hidden"
            >
               {result.successMessage ? (
                    <div className="py-24 text-center space-y-10">
                        <motion.div 
                            initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                            className="w-24 h-24 bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] mx-auto rounded-full"
                        >
                            <Verified size={44} />
                        </motion.div>
                        <div>
                            <h2 className="font-playfair text-4xl font-black text-white italic tracking-tighter uppercase">{result.successMessage}</h2>
                            <p className="text-[10px] tracking-[4px] uppercase text-[#7a6e5c] mt-4 font-black">Ingress Authorized • Safe to Proceed</p>
                        </div>
                        <button 
                            onClick={handleNextScan} 
                            className="btn-gold !py-6 px-16 text-[12px]"
                        >
                            Listen Next
                        </button>
                    </div>
               ) : (
                  <div className="divide-y divide-[#c9a84c]/10">
                      <div className="p-10 flex items-center justify-between bg-[#c9a84c]/5">
                          <div className="flex items-center gap-8">
                               <div className="w-16 h-16 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]">
                                   <User size={32} />
                               </div>
                               <div>
                                   <h3 className="font-playfair text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{result.holder}</h3>
                                   <p className="text-[10px] tracking-[3px] uppercase text-[#c9a84c] mt-3 font-black">Identity Signature Verified • {result.quantity} Pax</p>
                               </div>
                          </div>
                      </div>

                      <div className="p-10 space-y-4">
                          {result.tickets.map((t) => (
                              <div 
                                  key={t.ticketId}
                                  onClick={() => !t.scanned && checkIn(result.bookingId, [t.ticketId])}
                                  className={`group flex items-center justify-between p-6 border transition-all ${
                                      t.scanned 
                                          ? 'bg-[#c9a84c]/5 border-[#c9a84c]/10 opacity-40' 
                                          : 'bg-white/[0.02] border-white/5 hover:border-[#c9a84c] cursor-pointer'
                                  }`}
                              >
                                  <div className="flex items-center gap-6">
                                      <div className={`w-8 h-8 border flex items-center justify-center transition-all ${
                                          t.scanned ? 'bg-[#c9a84c] text-black border-transparent shadow-[0_0_15px_rgba(201,168,76,0.3)]' : 'border-white/20 group-hover:border-[#c9a84c]'
                                      }`}>
                                          {t.scanned && <CheckCircle size={16} strokeWidth={3} />}
                                      </div>
                                      <div>
                                          <p className="text-white/60 font-mono text-[11px] tracking-widest">{t.ticketId}</p>
                                          {t.scanned && <p className="text-[9px] font-black text-[#c9a84c] uppercase tracking-[2px] mt-1 italic">Ingressed • {new Date(t.scannedAt).toLocaleTimeString()}</p>}
                                      </div>
                                  </div>
                                  <div className={`text-[10px] font-black tracking-[3px] uppercase ${t.scanned ? 'text-[#c9a84c]' : 'text-[#7a6e5c]'}`}>
                                      {t.scanned ? 'Authorized' : 'Grant Entry'}
                                  </div>
                              </div>
                          ))}
                      </div>

                      <div className="p-8 bg-[#070503] flex justify-center">
                          <button 
                              onClick={handleNextScan} 
                              className="text-[10px] font-black uppercase tracking-[4px] text-[#7a6e5c] hover:text-[#c9a84c] transition-colors"
                          >
                              Displace Node & Re-Scan
                          </button>
                      </div>
                  </div>
               )}
            </motion.div>
          ) : error ? (
            <motion.div 
               key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
               className="border border-red-500/30 bg-red-500/5 p-16 text-center"
            >
               <AlertTriangle size={52} className="text-red-500 mx-auto mb-8 animate-pulse" />
               <h2 className="font-playfair text-3xl font-black text-white italic tracking-tighter uppercase">Signature Corrupted</h2>
               <p className="text-[11px] tracking-[4px] uppercase text-red-500/60 mt-4 font-black">{error.msg}</p>
               <button onClick={handleNextScan} className="mt-12 btn-gold !bg-red-500 !text-white !border-none px-12 py-5">Try Alternate Node</button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Live History Feed */}
        {recentScans.length > 0 && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="pt-12 border-t border-white/5 space-y-8"
           >
              <div className="flex items-center gap-4">
                 <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#c9a84c]/20" />
                 <h3 className="text-[10px] tracking-[5px] uppercase text-[#7a6e5c] font-black">Registry Feed</h3>
                 <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#c9a84c]/20" />
              </div>

              <div className="space-y-3">
                 {recentScans.map((scan, i) => (
                    <motion.div 
                      key={scan.ticketId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-5 bg-[#c9a84c]/5 border border-[#c9a84c]/10"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_green]" />
                          <div>
                             <span className="text-white text-xs font-bold uppercase tracking-tight">{scan.holder}</span>
                             <span className="text-[9px] text-[#7a6e5c] uppercase ml-3 tracking-widest">{scan.quantity} Pax</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="text-white/40 font-mono text-[9px] tracking-tighter">{scan.ticketId}</span>
                          <span className="text-[#c9a84c] text-[9px] font-black uppercase tracking-widest">{scan.time}</span>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </motion.div>
        )}
      </div>
    </div>
  );
}
