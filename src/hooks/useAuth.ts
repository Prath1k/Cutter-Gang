'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error('Error signing in with Google:', error.message);
  };

  const signOut = async () => {
    // 1. Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out from Supabase:', error.message);

    // 2. Clear vetting cookie via API
    try {
      await fetch('/api/gate/logout', { method: 'POST' });
    } catch (e) {
      console.error('Error clearing vetting cookie:', e);
    }

    // 3. Force refresh to trigger middleware redirect to /gate
    window.location.href = '/';
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };
}
