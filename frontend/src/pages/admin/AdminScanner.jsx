// ─── pages/admin/AdminScanner.jsx ──────────────────────────────────────────────
// Live QR Scanner for attendee check-in
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ShieldCheck, User, QrCode, CheckCircle, XCircle, Clock, Smartphone } from 'lucide-react';
import api from '../../api';

export default function AdminScanner() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    });

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, []);

  async function onScanSuccess(decodedText) {
    if (loading || checkInLoading) return;
    
    console.log("Scanned:", decodedText);
    
    setLoading(true);
    setResult(null);
    setError(null);
    setSelectedTickets([]); // Reset selection

    try {
      const { data } = await api.post('/admin/verify-ticket', { ticketId: decodedText });
      setResult(data);
      // Automatically pre-select the scanned ticket if not already scanned
      const scannedTicket = data.tickets.find(t => t.ticketId === decodedText);
      if (scannedTicket && !scannedTicket.scanned) {
        setSelectedTickets([decodedText]);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid or Corrupt QR';
      setError({
        msg,
        holder: err.response?.data?.holder,
        scannedAt: err.response?.data?.scannedAt
      });
      setTimeout(() => setError(null), 8000);
    } finally {
      setLoading(false);
    }
  }

  function onScanFailure(error) {}

  async function handleCheckIn() {
    if (selectedTickets.length === 0) return;
    setCheckInLoading(true);
    try {
      await api.post(`/admin/bookings/${result.bookingId}/check-in`, { ticketIds: selectedTickets });
      // Show success briefly then reset for next scan
      setResult({ ...result, successMessage: 'Check-in Successful!' });
      setTimeout(() => {
        setResult(null);
        setSelectedTickets([]);
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckInLoading(false);
    }
  }

  const toggleTicket = (id) => {
    setSelectedTickets(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-12 text-center lg:text-left px-4">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Attendance</h1>
        <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">LIVE VERIFICATION NODE</p>
      </div>

      <div className="space-y-8 px-4">
        {/* Scanner Container */}
        {!result && (
          <div className="card !p-2 bg-black border-white/10 overflow-hidden relative group">
            <div id="reader" className="w-full h-auto rounded-2xl overflow-hidden" />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card flex items-center justify-center py-12 animate-pulse bg-white/[0.02]">
            <div className="flex flex-col items-center gap-4">
               <div className="spinner w-8 h-8" />
               <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Identifying Booking...</p>
            </div>
          </div>
        )}

        {/* Result: Multi-Ticket Selector */}
        {result && (
          <div className="card border-white/10 bg-white/[0.02] animate-slide-up !p-8">
            {result.successMessage ? (
              <div className="text-center py-12">
                 <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mx-auto mb-6">
                    <CheckCircle size={32} />
                 </div>
                 <p className="text-white font-black text-2xl uppercase tracking-tighter">{result.successMessage}</p>
                 <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-2 tracking-[0.2em]">Ready for next scan...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-white font-black text-xl tracking-tight uppercase leading-none">{result.holder}</p>
                      <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-2">
                        {result.quantity} People • Booking Identified
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setResult(null)} className="text-white/20 hover:text-white/40 transition-colors">
                    <XCircle size={18} />
                  </button>
                </div>

                <div className="space-y-3 mb-10">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Select Attendees</p>
                  {result.tickets.map((t) => (
                    <div 
                      key={t.ticketId}
                      onClick={() => !t.scanned && toggleTicket(t.ticketId)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        t.scanned 
                          ? 'bg-green-500/5 border-green-500/20 opacity-50' 
                          : selectedTickets.includes(t.ticketId)
                          ? 'bg-yellow-500/10 border-yellow-500/40'
                          : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                          t.scanned 
                            ? 'bg-green-500 text-black' 
                            : selectedTickets.includes(t.ticketId)
                            ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                            : 'border-2 border-white/20'
                        }`}>
                          {(t.scanned || selectedTickets.includes(t.ticketId)) && <CheckCircle size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <p className="text-white text-xs font-black tracking-widest">{t.ticketId}</p>
                          {t.scanned && (
                            <p className="text-green-500/60 text-[8px] font-bold uppercase mt-1">
                              Scanned {new Date(t.scannedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${t.scanned ? 'text-green-500' : 'text-white/20'}`}>
                        {t.scanned ? 'PRESENT' : 'WAITING'}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  disabled={selectedTickets.length === 0 || checkInLoading}
                  onClick={handleCheckIn}
                  className={`w-full py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all relative overflow-hidden group ${
                    selectedTickets.length > 0 
                      ? 'bg-white text-black hover:bg-zinc-200' 
                      : 'bg-white/5 text-white/10 cursor-not-allowed'
                  }`}
                >
                  {checkInLoading ? 'Processing...' : `Confirm Check-in (${selectedTickets.length} People)`}
                </button>
              </>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card border-red-500/20 bg-red-500/5 animate-shake !p-8">
             <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                <XCircle size={24} />
              </div>
              <div>
                <p className="text-red-500 text-xs font-black uppercase tracking-widest">Verification Denied</p>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">{error.msg}</p>
              </div>
            </div>
          </div>
        )}

        {!result && !error && !loading && (
          <div className="card text-center !p-12 border-white/5 bg-white/[0.01]">
             <QrCode size={48} className="text-white/10 mx-auto mb-6 opacity-40 animate-pulse-slow" />
             <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Awaiting QR Signature...</p>
          </div>
        )}

        <p className="text-center flex items-center justify-center gap-2 text-[10px] text-white/10 font-black uppercase tracking-widest pt-8">
          <ShieldCheck size={12} /> Secure Entry Node active
        </p>
      </div>
    </div>
  );
}
