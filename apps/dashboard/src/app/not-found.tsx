import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logo-black.svg"
            alt="Waldo"
            width={200}
            height={80}
            priority
            className="dark:hidden"
          />
          <Image
            src="/logo-white.svg"
            alt="Waldo"
            width={200}
            height={80}
            priority
            className="hidden dark:block"
          />
        </div>

        {/* 404 Error */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-primary dark:text-primary-foreground">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Página no encontrada
          </h2>
          <p className="text-muted-foreground text-lg">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Volver al dashboard
          </Link>

          <div className="text-sm text-muted-foreground">
            <p>¿Necesitas ayuda?</p>
            <p>Contacta con el administrador del sistema</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center space-x-2 opacity-20">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
