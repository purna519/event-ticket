import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Send, ArrowLeft, Info, FileText } from 'lucide-react';
import api from '../api';

export default function SubmitPage() {
  const navigate = useNavigate();
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr.trim()) return setError('Please enter a valid UTR number.');
    
    setSubmitting(true);
    setError('');
    
    try {
      // Assuming back-end has an endpoint for manual UTR submission
      await api.post('/bookings/submit-utr', { utr });
      setSuccess(true);
      setTimeout(() => navigate('/history'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit transaction ID.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070503] pt-[120px] pb-20 px-6">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#c9a84c] text-[10px] uppercase tracking-[3px] mb-12 hover:opacity-70 transition-all">
           <ArrowLeft size={14} /> Back to Production
        </button>

        <div className="card-premium !p-10 space-y-10">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                 <ShieldCheck size={28} />
              </div>
              <div>
                 <h1 className="font-playfair text-3xl font-bold text-white uppercase italic tracking-tight">Post-Production Proof</h1>
                 <p className="text-[10px] tracking-[2px] uppercase text-[#7a6e5c]">Submit your transaction UTR node</p>
              </div>
           </div>

           {success ? (
             <div className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto text-green-500">
                   <Send size={32} />
                </div>
                <h2 className="font-playfair text-2xl text-white italic">Transmission Received.</h2>
                <p className="text-[11px] text-[#7a6e5c] uppercase tracking-widest">Redirecting to project history...</p>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-black flex items-center gap-2">
                      <FileText size={14} /> 12-Digit UTR Node
                   </label>
                   <input 
                      className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-5 text-white font-mono text-xl outline-none focus:border-[#c9a84c] transition-all placeholder:text-white/5"
                      placeholder="ENTER TRANSACTION ID..."
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
                   />
                   {error && <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold">{error}</p>}
                </div>

                <div className="p-6 bg-[#c9a84c]/5 border border-[#c9a84c]/10 flex gap-4">
                   <Info size={18} className="text-[#c9a84c] shrink-0" />
                   <p className="text-[11px] text-[#7a6e5c] leading-relaxed italic">
                      UTR is a unique 12-digit number provided by your UPI app (GPay/PhonePe/Paytm) after successful payment. Ensure accuracy for instant verification.
                   </p>
                </div>

                <button 
                  disabled={submitting}
                  className="w-full btn-gold py-6 text-[12px] flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {submitting ? 'Verifying Node...' : 'Submit Transmission Proof'}
                  <Send size={16} />
                </button>
             </form>
           )}
        </div>
      </div>
    </div>
  );
}
