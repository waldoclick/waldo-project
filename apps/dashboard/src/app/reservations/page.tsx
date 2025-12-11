'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReservationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de reservas usadas
    router.replace('/reservations/used');
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Redirigiendo a reservas usadas...</div>
        </div>
      </div>
    </div>
  );
}
