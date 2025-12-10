'use client';

import Image from 'next/image';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo arriba del formulario */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-black.svg"
            alt="Logo"
            width={150}
            height={50}
            priority
          />
        </div>

        {/* Contenedor del formulario */}
        <div className="bg-background rounded-lg p-8">{children}</div>
      </div>
    </div>
  );
}
