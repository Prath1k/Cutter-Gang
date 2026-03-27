'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, ShieldAlert } from 'lucide-react';

export default function GatePage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // Focus the input when mounted
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Success! Redirect to home
        window.location.href = '/'; // Using full reload to ensure middleware reflects latest cookie
      } else {
        setError(data.error || 'Access Denied');
      }
    } catch (err) {
      setError('Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/5 blur-[120px] rounded-full"></div>

      <div className="max-w-md w-full relative z-10 text-center">
        {/* Logo/Icon */}
        <div className="mb-12 relative inline-block group">
          <div className="absolute inset-0 bg-red-600 blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto relative border border-white/10 shadow-2xl transition-transform hover:scale-110 active:scale-95 duration-500">
            <span className="text-black text-6xl font-black leading-none select-none">*</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
          Cutter<span className="text-red-600">Gang</span>
        </h1>
        <p className="text-neutral-500 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-12">
          Private Access Only
        </p>

        {error && (
          <div className="mb-8 p-4 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span className="uppercase tracking-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          <div className="relative group">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 group-focus-within:text-red-600 transition-colors" />
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER PASSCODE"
              className="w-full bg-neutral-900 border-2 border-neutral-800 text-white px-16 py-6 rounded-3xl outline-none focus:border-red-600 transition-all font-black tracking-[0.3em] text-center placeholder:text-neutral-800 placeholder:tracking-tighter"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-white text-black font-black uppercase tracking-widest py-6 rounded-3xl hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/5 disabled:bg-neutral-800 disabled:text-neutral-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                VERIFYING...
              </>
            ) : (
              'ENTER THE GANG'
            )}
          </button>
        </form>

        <p className="mt-12 text-[9px] text-neutral-700 font-black uppercase tracking-widest leading-relaxed">
          Authorized personnel only.<br />
          Attempts are logged by IP.
        </p>
      </div>
    </div>
  );
}
