import { useState } from 'react';
import { 
  CreditCard, UserPlus, Send, CheckCircle, 
  AlertCircle, Smartphone, User, Mail, ShieldCheck,
  RefreshCcw, Copy, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

export default function AdminBoxOffice() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', quantity: 1, source: 'Box Office'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { message, paymentLink, bookingId }
  const [error, setError] = useState('');

  const handleIssueLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    const activeEventId = localStorage.getItem('activeEventId');
    try {
      const { data } = await api.post('/admin/issue-ticket', { ...formData, eventId: activeEventId });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSale = async () => {
    if (!window.confirm('Confirm direct sale? This skips payment and issues the ticket immediately.')) return;
    setLoading(true);
    setError('');
    setResult(null);
    const activeEventId = localStorage.getItem('activeEventId');
    try {
      const { data } = await api.post('/admin/bookings/manual', { ...formData, eventId: activeEventId });
      setResult({ ...data, message: 'Ticket Issued Successfully (Direct Sale)' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue ticket');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link Copied to Tactical Clipboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-[10px] tracking-[5px] uppercase text-[#c9a84c] font-bold flex items-center justify-center gap-3">
           <ShieldCheck size={14} /> Tactical Node Area
        </div>
        <h1 className="font-playfair text-[56px] font-black leading-none text-white uppercase tracking-tight">
          Box<br /><em className="text-[#c9a84c] not-italic italic">Office</em>
        </h1>
        <p className="text-[10px] tracking-[4px] text-[#7a6e5c] uppercase">On-ground ticketing terminal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Terminal */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="card-premium !p-10 space-y-8 h-fit"
        >
          <div className="flex items-center gap-4 border-b border-[#c9a84c]/10 pb-6 mb-2">
             <div className="w-10 h-10 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                <UserPlus size={18} />
             </div>
             <h3 className="font-playfair text-xl font-bold text-white uppercase tracking-wider">Attendee Data</h3>
          </div>

          <form onSubmit={handleIssueLink} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold flex items-center gap-2"><User size={10} /> Full Name</label>
                <input 
                  required
                  className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-4 text-white text-[14px] outline-none focus:border-[#c9a84c]"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold flex items-center gap-2"><Smartphone size={10} /> Phone Vector</label>
                <input 
                  required
                  className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-4 text-white font-mono text-[14px] outline-none focus:border-[#c9a84c]"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
             </div>

             <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold flex items-center gap-2"><Mail size={10} /> Email Registry</label>
                <input 
                  required type="email"
                  className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-4 text-white text-[14px] outline-none focus:border-[#c9a84c]"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
             </div>

             <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold">Quantity</label>
                <input 
                  required type="number" min="1"
                  className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-4 text-white text-[14px] outline-none focus:border-[#c9a84c]"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                />
             </div>

             <div className="grid grid-cols-1 gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-gold !w-full flex items-center justify-center gap-3 !py-5 uppercase tracking-[4px]"
                >
                  {loading ? <RefreshCcw size={16} className="animate-spin" /> : <><Send size={16} /> Issue Payment Link</>}
                </button>
                <button 
                  type="button"
                  onClick={handleDirectSale}
                  disabled={loading}
                  className="w-full py-5 border border-[#7a6e5c]/20 text-[#7a6e5c] uppercase text-[10px] tracking-[4px] font-bold hover:bg-[#c9a84c]/5 transition-all"
                >
                  Direct Register (Offline/Cash)
                </button>
             </div>
          </form>
        </motion.div>

        {/* Output Terminal */}
        <div className="space-y-8">
           <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  key="result"
                  className="card-premium !p-10 border border-[#c9a84c] relative overflow-hidden h-full"
                >
                   <div className="absolute top-0 right-0 p-6">
                      <CheckCircle size={32} className="text-[#c9a84c] animate-pulse" />
                   </div>
                   
                   <div className="space-y-10">
                      <div>
                         <h3 className="font-playfair text-3xl font-bold text-white uppercase tracking-tight mb-2">Operation Success</h3>
                         <p className="text-[10px] tracking-[3px] text-[#7a6e5c] uppercase">{result.message}</p>
                      </div>

                      {result.paymentLink && (
                        <div className="space-y-4">
                           <div className="p-6 bg-[#c9a84c]/5 border border-[#c9a84c]/10 rounded-sm">
                              <p className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold mb-3">Generated Link</p>
                              <code className="text-[10px] text-white break-all block opacity-60 mb-6">{result.paymentLink}</code>
                              <div className="flex gap-4">
                                 <button 
                                   onClick={() => copyToClipboard(result.paymentLink)}
                                   className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#c9a84c] text-[#070503] text-[9px] font-bold uppercase tracking-widest"
                                 >
                                    <Copy size={14} /> Copy Link
                                 </button>
                                 <a 
                                   href={result.paymentLink} target="_blank" rel="noreferrer"
                                   className="flex-1 flex items-center justify-center gap-2 p-3 border border-[#c9a84c]/20 text-[#c9a84c] text-[9px] font-bold uppercase tracking-widest"
                                 >
                                    <ExternalLink size={14} /> Test Link
                                 </a>
                              </div>
                           </div>
                           <p className="text-[9px] tracking-widest text-[#7a6e5c] uppercase text-center">SHARE THIS LINK WITH THE ATTENDEE FOR DIGITAL PAYMENT</p>
                        </div>
                      )}

                      {!result.paymentLink && (
                        <div className="pt-10 border-t border-[#c9a84c]/10 flex flex-col items-center gap-6">
                           <div className="w-16 h-16 bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] rounded-full">
                              <CheckCircle size={32} />
                           </div>
                           <p className="text-[11px] tracking-[4px] text-white uppercase font-bold">Attendee Registered Locally</p>
                           <button onClick={() => setResult(null)} className="text-[10px] text-[#7a6e5c] hover:text-[#c9a84c] uppercase tracking-widest underline">Reset Terminal</button>
                        </div>
                      )}
                   </div>
                </motion.div>
              ) : error ? (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                   key="error"
                   className="card-premium !p-10 border border-red-500/30"
                >
                   <div className="flex flex-col items-center gap-6 text-center py-10">
                      <AlertCircle size={48} className="text-red-500" />
                      <p className="text-white font-playfair text-2xl font-bold uppercase">{error}</p>
                      <button onClick={() => setError('')} className="btn-gold !bg-red-500 !border-red-500 text-white">RETRY NODE</button>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  key="idle"
                  className="h-full border border-[#c9a84c]/5 bg-[#c9a84c]/[0.02] flex flex-col items-center justify-center p-20 text-center gap-6 grayscale opacity-30"
                >
                   <CreditCard size={48} />
                   <div className="space-y-1">
                      <p className="text-[12px] text-white font-bold uppercase tracking-[4px]">Awaiting Signal</p>
                      <p className="text-[9px] text-[#7a6e5c] uppercase tracking-[3px]">Fill details to generate invoice</p>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
