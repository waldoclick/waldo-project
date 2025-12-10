'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if running in Electron
    const isElectron =
      typeof window !== 'undefined' &&
      window.navigator.userAgent.includes('Electron');

    if (isElectron) {
      // In Electron, redirect to login automatically
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
      <Image
        src="/logo-black.svg"
        alt="Waldo"
        width={300}
        height={120}
        priority
      />
    </div>
  );
}
