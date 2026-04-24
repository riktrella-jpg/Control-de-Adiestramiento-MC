"use client";

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/supabase/client';

export function useUser() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getUser() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
