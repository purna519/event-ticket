import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/user/auth/verify-otp', { email, otp });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 anim-fade-in text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 animate-pulse">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Verify Your Email</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
            We've sent a 6-digit code to:<br/>
            <span className="text-white normal-case font-black">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2">
            <input
              type="text"
              maxLength={6}
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-5 text-center text-4xl font-black tracking-[1em] text-white focus:border-white/40 focus:bg-zinc-800 transition-all outline-none"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-500 text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-2 uppercase tracking-tighter"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Verify Account <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <button 
           onClick={() => api.post('/user/auth/reset-password-request', { email })}
           className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}
