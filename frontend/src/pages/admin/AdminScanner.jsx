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
    if (loading) return;
    
    // Play a beep or haptic feedback if possible
    console.log("Scanned:", decodedText);
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data } = await api.post('/admin/verify-ticket', { ticketId: decodedText });
      setResult(data);
      // Optional: Clear result after 5 seconds to stay ready for next scan
      setTimeout(() => setResult(null), 8000);
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

  function onScanFailure(error) {
    // Console is too noisy with failures, ignore
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-12 text-center lg:text-left">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Attendance Scanner</h1>
        <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">LIVE VERIFICATION NODE</p>
      </div>

      <div className="space-y-8">
        {/* Scanner Container */}
        <div className="card !p-2 bg-black border-white/10 overflow-hidden relative group">
          <div id="reader" className="w-full h-auto rounded-2xl overflow-hidden" />
          
          {/* Decorative Corner Borders */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/40 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/40 rounded-br-lg pointer-events-none" />
        </div>

        {/* Manual Input Fallback */}
        <div className="flex items-center gap-4 text-white/20 px-4">
           <Smartphone size={14} />
           <p className="text-[10px] font-bold uppercase tracking-widest">Ensuring camera access is active</p>
        </div>

        {/* Feedback Overlay/Card */}
        {loading && (
          <div className="card flex items-center justify-center py-12 animate-pulse bg-white/[0.02]">
            <div className="flex flex-col items-center gap-4">
               <div className="spinner w-8 h-8" />
               <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Synchronising...</p>
            </div>
          </div>
        )}

        {result && (
          <div className="card border-green-500/20 bg-green-500/5 animate-slide-up !p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-green-500 text-xs font-black uppercase tracking-widest">Access Granted</p>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest leading-none mt-1">
                  Ticket: {result.ticketId} • Qty: {result.quantity}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <User size={16} className="text-white/20" />
                  <p className="text-white font-black text-xl tracking-tight uppercase">{result.holder}</p>
               </div>
               <div className="flex items-center gap-3">
                  <Clock size={16} className="text-white/20" />
                  <p className="text-white/50 text-xs font-bold leading-none">Scanned at {new Date(result.scannedAt).toLocaleTimeString()}</p>
               </div>
            </div>
          </div>
        )}

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

            {error.holder && (
               <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={14} className="text-white/10" />
                    <p className="text-white/40 font-bold text-sm uppercase">{error.holder}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-white/10" />
                    <p className="text-white/20 text-[10px] font-bold uppercase">PREVIOUSLY SCANNED: {new Date(error.scannedAt).toLocaleTimeString()}</p>
                  </div>
               </div>
            )}
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
