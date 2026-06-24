'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/app-state-provider';

export default function HomeRedirect() {
  const { user, isNewUser } = useAppState();
  const router = useRouter();

  useEffect(() => {
    // If we're rendering, useAppState already ensures user is loaded
    if (user) {
      if (isNewUser) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    } else {
      router.replace('/login');
    }
  }, [user, isNewUser, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div
        aria-label="Cargando…"
        className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
      />
    </div>
  );
}
