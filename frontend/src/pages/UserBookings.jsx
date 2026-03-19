import React, { useState, useEffect } from 'react';
import api from '../api';
import { Ticket, Clock, CheckCircle, XCircle, Download, Info, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    
    // Auto-reload every 10 seconds to catch status updates
    const interval = setInterval(fetchBookings, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (bookingId, ticketId) => {
    try {
      const resp = await api.get(`/bookings/ticket/${bookingId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download ticket');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 anim-fade-in">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-all group">
            <ArrowLeft className="w-6 h-6 text-zinc-500 group-hover:text-white" />
          </Link>
          <div className="text-center">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">Booking History</h1>
             <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage your event access</p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Status Help Note */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-start gap-4">
          <div className="p-2 bg-white/10 rounded-full">
            <Info className="w-4 h-4 text-white" />
          </div>
          <p className="text-zinc-400 text-xs font-bold leading-relaxed uppercase tracking-tight">
             Your tickets will be approved within <span className="text-white">10 minutes</span>. 
             Once verified, you'll receive the PDF in your <span className="text-white">Email</span> 
             and can also download it directly below.
          </p>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
              <Ticket className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">No bookings found yet</p>
              <Link to="/" className="mt-4 inline-block text-[10px] text-white underline font-black uppercase tracking-widest">Browse Events</Link>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b._id} className="group p-6 bg-zinc-900/40 border border-white/5 hover:border-white/20 rounded-3xl transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${
                      b.status === 'verified' ? 'bg-green-500/10' : 
                      b.status === 'rejected' ? 'bg-red-500/10' : 'bg-orange-500/10'
                    }`}>
                      {b.status === 'verified' ? <CheckCircle className="w-6 h-6 text-green-500" /> : 
                       b.status === 'rejected' ? <XCircle className="w-6 h-6 text-red-500" /> : 
                       <Clock className="w-6 h-6 text-orange-500" />}
                    </div>
                    <div>
                      <h3 className="font-black text-lg tracking-tight uppercase">{b.quantity} Tickets</h3>
                      <div className="flex flex-col gap-1">
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Booked on {new Date(b.createdAt).toLocaleDateString()}</p>
                        <p className="text-zinc-600 text-[9px] font-mono uppercase tracking-widest">UTR: {b.utr || 'INTERNAL_GEN'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        b.status === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                        b.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        'bg-orange-500/10 border-orange-500/20 text-orange-500'
                     }`}>
                       {b.status}
                     </span>

                     {b.status === 'verified' && (
                       <button 
                         onClick={() => handleDownload(b._id, b.ticketId)}
                         className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
                       >
                         <Download className="w-3 h-3" />
                         Download PDF
                       </button>
                     )}
                  </div>
                </div>
                
                {b.status === 'rejected' && b.rejectionReason && (
                   <p className="mt-4 text-[10px] text-red-400 font-bold uppercase tracking-tight opacity-70">
                     Note: {b.rejectionReason}
                   </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
