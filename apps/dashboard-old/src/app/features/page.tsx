'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FeaturesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de destacados usados
    router.replace('/features/used');
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">
            Redirigiendo a destacados usados...
          </div>
        </div>
      </div>
    </div>
  );
}
