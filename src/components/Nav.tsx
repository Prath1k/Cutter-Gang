'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Menu, LogOut, LogIn } from 'lucide-react';
import { UploadVideo } from '@/components/UploadVideo';
import { useAuth } from '@/hooks/useAuth';

export function Nav() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hydration safe: render placeholder on server/initial client to match
  if (!isMounted) {
    return (
      <header className="fixed top-2 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] max-w-6xl pointer-events-none">
        <div className="h-[74px] sm:h-[84px] bg-white/95 backdrop-blur-md rounded-3xl sm:rounded-full shadow-2xl border border-neutral-200" />
      </header>
    );
  }

  return (
    <header className="fixed top-2 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] max-w-6xl pointer-events-none">
      <div className="bg-white/95 backdrop-blur-md text-black rounded-3xl sm:rounded-full px-4 sm:px-8 py-3 sm:py-5 flex items-center shadow-2xl border border-neutral-200 pointer-events-auto transition-all duration-500 hover:shadow-red-600/5">
        
        {/* Left Side: Mobile Menu / Desktop Links */}
        <div className="flex-1 flex items-center gap-4 z-10">
          <nav className="hidden lg:flex items-center gap-10 font-black uppercase tracking-tighter text-sm">
            <Link href="/" className="hover:text-red-600 transition-all duration-300 hover:scale-110 active:scale-95">Feed</Link>
            <Link href="/gang" className="hover:text-red-600 transition-all duration-300 hover:scale-110 active:scale-95">The Gang</Link>
          </nav>
          <button className="lg:hidden p-2 hover:bg-neutral-100 rounded-full transition-all active:scale-90">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Center: Logo (Flexible Centering) */}
        <div className="flex-shrink-0 text-xl sm:text-2xl font-black tracking-tighter uppercase flex items-center gap-1 group cursor-default select-none transition-transform duration-500 hover:scale-105 active:scale-95 mx-4">
          <span className="group-hover:text-red-600 transition-colors duration-300">CUTTERGANG</span>
          <span className="text-red-600 text-3xl leading-none animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]">*</span>
        </div>
        
        {/* Right Side: Actions (Flexible) */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-6 z-10">
          <UploadVideo />
          
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:opacity-80 transition-all hover:scale-105 active:scale-95">
                    {user.user_metadata.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border-2 border-red-600 shadow-lg shadow-red-600/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center border-2 border-red-600">
                        <User className="w-4 h-4 text-neutral-600" />
                      </div>
                    )}
                  </button>
                  
                  {/* Sign Out Overlay */}
                  <div className="absolute right-0 mt-4 w-48 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-neutral-100 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                    <div className="px-4 py-2 border-b border-neutral-50 mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Status</p>
                      <p className="text-xs font-bold truncate">{user.user_metadata.full_name || user.email}</p>
                    </div>
                    <button 
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-xs font-black uppercase tracking-tighter hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="flex items-center gap-2 bg-black text-white px-5 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-tighter hover:bg-red-600 transition-all duration-300 active:scale-95 shadow-xl shadow-black/10 hover:shadow-red-600/20"
              >
                <LogIn className="w-4 h-4" />
                Auth
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
