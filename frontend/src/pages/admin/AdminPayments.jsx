// ─── pages/admin/AdminPayments.jsx ────────────────────────────────────────────
// Manage payment records: CSV upload + manual entry + table view
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from 'react';
import { Upload, Edit3, Search, CreditCard, Check, X, Info, Trash2, Edit2 } from 'lucide-react';
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

  useEffect(fetchPayments, []);

  // ── CSV Upload ────────────────────────────────────────────────────────────
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

  // ── Manual Entry ──────────────────────────────────────────────────────────
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
    <div>
      <div className="mb-12">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Payment Records</h1>
        <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mt-2">BULK UPLOAD AND MANUAL ENTRY</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* CSV Upload */}
        <div className="card !p-6 sm:!p-8">
          <h2 className="text-white font-black text-sm mb-1 flex items-center gap-2 uppercase tracking-tight">
            <Upload size={18} className="text-white/20" /> Upload CSV
          </h2>
          <p className="text-white/40 text-[10px] sm:text-xs mb-4">Required columns: UTR, Amount, Date</p>
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
            className={`btn-primary cursor-pointer px-4 py-3 !text-[11px] sm:!text-xs ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? <div className="spinner" /> : <><Upload size={14} className="mr-2" /> Choose CSV</>}
          </label>
          {uploadResult && (
            <div className={`mt-3 p-3 rounded-xl text-[11px] sm:text-xs ${uploadResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {uploadResult.msg}
            </div>
          )}
          {/* CSV Format Example */}
          <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/5 overflow-x-auto no-scrollbar">
            <p className="text-white/30 text-[10px] font-mono whitespace-nowrap">UTR,Amount,Date<br />
            306120563434,499,2026-04-01</p>
          </div>
        </div>

        {/* Manual Entry */}
        <div className="card !p-6 sm:!p-8">
          <h2 className="text-white font-black text-sm mb-1 flex items-center gap-2 uppercase tracking-tight">
            <Edit3 size={18} className="text-white/20" /> Manual Entry
          </h2>
          <p className="text-white/40 text-[10px] sm:text-xs mb-4">Add a single payment record</p>
          <form onSubmit={handleManual} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="input-label">UTR</label>
                <input
                  type="text"
                  value={manual.utr}
                  onChange={(e) => setManual((p) => ({ ...p, utr: e.target.value }))}
                  placeholder="30612...34"
                  required
                  className="input font-mono !py-3"
                />
              </div>
              <div>
                <label className="input-label">Amount (₹)</label>
                <input
                  type="number"
                  value={manual.amount}
                  onChange={(e) => setManual((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="499"
                  required
                  min="1"
                  className="input !py-3"
                />
              </div>
            </div>
            {manualMsg && (
              <p className={`text-[11px] ${manualMsg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
                {manualMsg}
              </p>
            )}
            <button type="submit" disabled={manualLoading} className="btn-primary py-3 !text-[11px] uppercase tracking-widest font-black">
              {manualLoading ? <div className="spinner" /> : 'Add Record'}
            </button>
          </form>
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-8 py-6 border-b border-white/5 bg-white/[0.01] gap-4">
          <h2 className="text-white font-black text-sm uppercase tracking-tight">Records ({payments.length})</h2>
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="input w-full py-2 pl-9 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-white/40 py-8 justify-center">
            <div className="spinner" /> Loading records…
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-white/30 text-center py-8 text-sm">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01]">
                  {['UTR', 'Amount', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="py-4 px-8 text-white/20 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors group">
                    <td className="py-5 px-8 font-mono text-white text-[11px] tracking-widest">{p.utr}</td>
                    <td className="py-5 px-8 text-white font-black text-[13px] tracking-tight">₹{p.amount}</td>
                    <td className="py-5 px-8 text-white/30 text-[11px] font-bold">{new Date(p.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                     <td className="py-5 px-8">
                      {p.used ? (
                        <span className="badge-rejected">Used</span>
                      ) : (
                        <span className="badge-unused">Available</span>
                      )}
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:bg-white hover:text-black transition-all duration-300"
                          title="Edit Payment"
                        >
                          <Edit2 size={13} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:bg-red-500 hover:text-white transition-all duration-300"
                          title="Delete Payment"
                        >
                          <Trash2 size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
