import { useEffect, useState } from 'react';
import { 
  Plus, Trash2, Ticket, Calendar, HardDrive, 
  CheckCircle, AlertTriangle, RefreshCcw, Settings, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

export default function AdminPromoCodes() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '', discountType: 'flat', discountValue: '', usageLimit: '', expiryDate: '', isActive: true
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/promos');
      setPromos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/promos', formData);
      setMsg('Promo Code Generated Successfully');
      setShowModal(false);
      setFormData({ code: '', discountType: 'flat', discountValue: '', usageLimit: '', expiryDate: '', isActive: true });
      fetchPromos();
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.error || 'Failed to save'));
    }
  };

  const deletePromo = async (id) => {
    if (!window.confirm('Exterminate this promo code?')) return;
    try {
      await api.delete(`/admin/promos/${id}`);
      fetchPromos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3 font-bold flex items-center gap-3">
             <Ticket size={14} /> Society Perks
          </div>
          <h1 className="font-playfair text-[clamp(42px,4vw,64px)] font-black leading-[0.9] tracking-[-2px] text-white">
            Promo<br /><em className="text-[#c9a84c] not-italic italic">Architect</em>
          </h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-gold flex items-center gap-3"
        >
          <Plus size={16} /> Forge New Code
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full" />
          <p className="text-[10px] tracking-[3px] uppercase text-[#7a6e5c]">Accessing code vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {promos.map((p, idx) => (
              <motion.div 
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-premium group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                   <button onClick={() => deletePromo(p._id)} className="text-[#7a6e5c] hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>

                <div className="p-8 space-y-6">
                   <div className="text-[10px] uppercase tracking-[3px] text-[#c9a84c] font-bold border-b border-[#c9a84c]/10 pb-4">
                      {p.isActive ? 'Active Node' : 'Inactive'}
                   </div>
                   
                   <div className="space-y-1">
                      <p className="font-playfair text-3xl font-black text-white">{p.code}</p>
                      <p className="text-[10px] tracking-[2px] uppercase text-[#7a6e5c]">
                        {p.discountType === 'flat' ? `₹${p.discountValue} OFF` : `${p.discountValue}% OFF`}
                      </p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#c9a84c]/5 p-4 border border-[#c9a84c]/10">
                         <p className="text-[8px] uppercase tracking-widest text-[#7a6e5c] mb-1">Used</p>
                         <p className="text-white font-bold">{p.usedCount} / {p.usageLimit || '∞'}</p>
                      </div>
                      <div className="bg-[#c9a84c]/5 p-4 border border-[#c9a84c]/10">
                         <p className="text-[8px] uppercase tracking-widest text-[#7a6e5c] mb-1">Expiry</p>
                         <p className="text-white font-bold text-[10px]">
                            {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'NEVER'}
                         </p>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Forge Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="absolute inset-0 bg-black/90 backdrop-blur-xl"
             onClick={() => setShowModal(false)}
           />
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
             className="relative w-full max-w-xl bg-[#070503] border border-[#c9a84c]/20 p-10 md:p-14 card-premium"
           >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 text-[#7a6e5c] hover:text-[#c9a84c] transition-colors"
                >
                <X size={24} />
              </button>

              <div className="mb-10">
                 <h2 className="font-playfair text-4xl font-black text-white uppercase tracking-tight mb-2">Forge Code</h2>
                 <p className="text-[10px] tracking-[3px] uppercase text-[#7a6e5c]">Deploy new perks to the society</p>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold">Encrypted Code</label>
                    <input 
                      required
                      className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-4 text-white font-playfair text-xl italic font-black outline-none focus:border-[#c9a84c]"
                      placeholder="e.g. BHAJAN20"
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold">Type</label>
                       <select 
                         className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-4 text-white text-[12px] outline-none"
                         value={formData.discountType}
                         onChange={e => setFormData({...formData, discountType: e.target.value})}
                       >
                          <option value="flat">Flat ₹ Discount</option>
                          <option value="percent">Percentage %</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold">Value</label>
                       <input 
                         required type="number"
                         className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-4 text-white text-[14px] outline-none"
                         value={formData.discountValue}
                         onChange={e => setFormData({...formData, discountValue: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold">Usage Limit</label>
                       <input 
                         type="number"
                         className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-4 text-white text-[14px] outline-none"
                         placeholder="Leave blank for ∞"
                         value={formData.usageLimit}
                         onChange={e => setFormData({...formData, usageLimit: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] uppercase tracking-[3px] text-[#c9a84c] font-bold">Expiry</label>
                       <input 
                         type="date"
                         className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/20 p-4 text-white text-[14px] outline-none text-left"
                         value={formData.expiryDate}
                         onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                       />
                    </div>
                 </div>

                 <button type="submit" className="btn-gold !w-full !py-6 text-lg tracking-[5px]">SYNC TO LEDGER</button>
              </form>
           </motion.div>
        </div>
      )}

      {/* Toast */}
      {msg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
           <div className="bg-[#c9a84c] text-[#070503] px-10 py-5 font-bold uppercase tracking-[4px] text-[11px] shadow-[0_20px_50px_rgba(201,168,76,0.2)]">
              {msg}
           </div>
        </div>
      )}
    </div>
  );
}
