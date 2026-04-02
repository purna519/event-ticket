import { useEffect, useState, useRef } from 'react';
import { 
  Upload, Edit3, Search, CreditCard, Check, X, 
  Info, Trash2, Edit2, FileSpreadsheet, ShieldCheck, 
  ArrowRight, Plus, RefreshCcw, DollarSign
} from 'lucide-react';
import api from '../../api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [manual, setManual] = useState({ utr: '', amount: '', date: '' });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualMsg, setManualMsg] = useState('');
  const [search, setSearch] = useState('');
  const fileRef = useRef();

  const fetchPayments = () => {
    setLoading(true);
    api.get('/admin/payments')
      .then((r) => setPayments(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  async function handleCsvUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/admin/payments/upload', formData);
      setUploadResult({ success: true, msg: data.message });
      fetchPayments();
    } catch (err) {
      setUploadResult({ success: false, msg: err.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
      fileRef.current.value = '';
    }
  }

  async function handleManual(e) {
    e.preventDefault();
    setManualLoading(true);
    setManualMsg('');
    try {
      await api.post('/admin/payments/manual', manual);
      setManualMsg('Payment record added');
      setManual({ utr: '', amount: '', date: '' });
      fetchPayments();
    } catch (err) {
      setManualMsg('Failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setManualLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this payment record?')) return;
    try {
      await api.delete(`/admin/payments/${id}`);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  }

  async function handleEdit(p) {
    const utr = window.prompt('UTR / Transaction ID:', p.utr) || p.utr;
    const amount = window.prompt('Amount (₹):', p.amount) || p.amount;
    const used = window.confirm(`Is this payment used? (Current: ${p.used ? 'YES' : 'NO'})`);

    if (utr === p.utr && amount === p.amount && used === p.used) return;

    try {
      await api.patch(`/admin/payments/${p._id}`, { utr, amount, used });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  }

  const filtered = payments.filter(
    (p) =>
      p.utr.toLowerCase().includes(search.toLowerCase()) ||
      String(p.amount).includes(search)
  );

  return (
    <div className="space-y-12 animate-hero-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3 font-bold flex items-center gap-3">
             <ShieldCheck size={14} /> Fiscal Ledger
          </div>
          <h1 className="font-playfair text-[clamp(42px,4vw,64px)] font-black leading-[0.9] tracking-[-2px] text-white">
            Monetary<br /><em className="text-[#c9a84c] not-italic italic">Archives</em>
          </h1>
        </div>
        <div>
            <button 
              onClick={fetchPayments}
              className="w-12 h-12 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-all"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* CSV Sync Section */}
        <div className="card-premium !p-8 md:!p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold text-white uppercase italic tracking-tight">Statement Sync</h2>
              <p className="text-[9px] tracking-[2px] uppercase text-[#7a6e5c]">Bulk CSV UTR Verification</p>
            </div>
          </div>

          <div className="bg-[#c9a84c]/[0.02] border border-dashed border-[#c9a84c]/20 p-8 text-center space-y-4">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
              id="csvInput"
            />
            <label
              htmlFor="csvInput"
              className={`inline-flex items-center gap-3 btn-gold !py-4 px-8 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {uploading ? <RefreshCcw className="animate-spin" size={16} /> : <><Upload size={16} /> Upload Statement</>}
            </label>
            <p className="text-[10px] text-[#7a6e5c] uppercase tracking-widest font-bold">Supported format: UTR, Amount, Date</p>
          </div>

          {uploadResult && (
            <div className={`p-4 border ${uploadResult.success ? 'bg-[#c9a84c]/10 border-[#c9a84c]/20 text-[#c9a84c]' : 'bg-red-500/10 border-red-500/20 text-red-500'} animate-slide-up`}>
              <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                {uploadResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />} {uploadResult.msg}
              </p>
            </div>
          )}
        </div>

        {/* Manual Entry Section */}
        <div className="card-premium !p-8 md:!p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#c9a84c]/5 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
              <Edit3 size={20} />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold text-white uppercase italic tracking-tight">Direct Injection</h2>
              <p className="text-[9px] tracking-[2px] uppercase text-[#7a6e5c]">Single Fiscal Record Entry</p>
            </div>
          </div>

          <form onSubmit={handleManual} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">UTR Reference</label>
                <input
                  required
                  className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-mono text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                  placeholder="30612...34"
                  value={manual.utr}
                  onChange={(e) => setManual((p) => ({ ...p, utr: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[2px] text-[#7a6e5c] font-bold">Amount (₹)</label>
                <input
                  type="number" required min="1"
                  className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                  placeholder="499"
                  value={manual.amount}
                  onChange={(e) => setManual((p) => ({ ...p, amount: e.target.value }))}
                />
              </div>
            </div>
            {manualMsg && (
              <p className={`text-[10px] items-center gap-2 font-bold uppercase tracking-widest ${manualMsg.includes('added') ? 'text-[#c9a84c]' : 'text-red-500'}`}>
                {manualMsg}
              </p>
            )}
            <button type="submit" disabled={manualLoading} className="w-full btn-gold py-5 flex items-center justify-center gap-3">
              {manualLoading ? <RefreshCcw className="animate-spin" size={16} /> : <>Commence Entry <Plus size={16} /></>}
            </button>
          </form>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h2 className="font-playfair text-3xl font-black text-white italic">Fiscal<span className="text-[#c9a84c]">Ledger</span></h2>
              <div className="relative group w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6e5c] group-focus-within:text-[#c9a84c] transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter Archives (UTR, Amount)..."
                  className="w-full bg-[#c9a84c]/[0.03] border border-[#c9a84c]/15 p-4 pl-12 text-white font-dm text-[14px] outline-none focus:border-[#c9a84c] transition-all"
                />
              </div>
          </div>

          <div className="card-premium !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#c9a84c]/10">
                    <th className="p-8 text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-bold">UTR ID</th>
                    <th className="p-8 text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-bold">Asset Value</th>
                    <th className="p-8 text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-bold">Timestamp</th>
                    <th className="p-8 text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-bold">Availability</th>
                    <th className="p-8 text-[10px] uppercase tracking-[3px] text-[#7a6e5c] font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c9a84c]/5">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center">
                        <div className="inline-block w-8 h-8 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full mb-4" />
                        <p className="text-[10px] tracking-[3px] uppercase text-[#7a6e5c]">Synchronizing vaults...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center text-[#7a6e5c] text-[11px] uppercase tracking-[3px]">
                        No fiscal entries discovered
                      </td>
                    </tr>
                  ) : filtered.map(p => (
                    <tr key={p._id} className="group hover:bg-[#c9a84c]/[0.02] transition-colors">
                      <td className="p-8 font-mono text-[13px] text-white tracking-widest group-hover:text-[#c9a84c] transition-colors">{p.utr}</td>
                      <td className="p-8 font-playfair text-white text-lg font-black italic">₹{p.amount}</td>
                      <td className="p-8 text-[11px] text-[#7a6e5c] uppercase font-bold tracking-widest">
                         {new Date(p.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-8">
                        {p.used ? (
                          <span className="text-[9px] font-bold uppercase tracking-[2px] px-3 py-1.5 border border-red-500/20 bg-red-500/5 text-red-500/60">Consumed</span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-[2px] px-3 py-1.5 border border-[#c9a84c]/20 bg-[#c9a84c]/5 text-[#c9a84c]">Available</span>
                        )}
                      </td>
                      <td className="p-8">
                        <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(p)} className="w-10 h-10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#070503] transition-all">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="w-10 h-10 border border-red-500/10 flex items-center justify-center text-red-500/30 hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
}
