import { Metadata } from 'next';
import Link from 'next/link';
import FormLogin from '@/components/form-login';
import { MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Inicio de sesión',
  description: 'Accede a tu cuenta del dashboard de Waldo.click®',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
        <p className="text-muted-foreground">
          Ingresa tus credenciales para acceder a tu cuenta
        </p>
      </div>

      <FormLogin />

      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          <MessageCircle className="mr-2 h-4 w-4 inline" />
          ¿Necesitas ayuda?{' '}
          <Link
            href="/support"
            className="text-primary hover:underline font-medium"
          >
            Contacta al administrador
          </Link>
        </p>
      </div>
    </div>
  );
}
