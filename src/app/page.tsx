'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

export default function HomeRedirect() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div
        aria-label="Cargando…"
        className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
      />
    </div>
  );
}
