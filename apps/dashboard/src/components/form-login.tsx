'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { login, isModerator } from '@/lib/strapi';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
import Swal from 'sweetalert2';

export default function FormLogin() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ejecutar reCAPTCHA
      const recaptchaToken = await recaptchaRef.current?.executeAsync();

      if (!recaptchaToken) {
        await Swal.fire({
          icon: 'warning',
          title: 'reCAPTCHA requerido',
          text: 'Por favor, completa el reCAPTCHA',
          confirmButtonText: 'Entendido',
        });
        return;
      }

      // Agregar token de reCAPTCHA a los datos del formulario
      const loginData = {
        ...formData,
        recaptchaToken,
      };

      const response = await login(loginData);

      // Verificar si el usuario es moderador
      if (!isModerator(response.user)) {
        await Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'Solo usuarios con rol "manager" pueden acceder al sistema',
          confirmButtonText: 'Entendido',
        });
        return;
      }

      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text:
          error instanceof Error ? error.message : 'Error al iniciar sesión',
        confirmButtonText: 'Intentar de nuevo',
      });
    } finally {
      setIsLoading(false);
      // Resetear reCAPTCHA
      recaptchaRef.current?.reset();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">Correo electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="identifier"
            name="identifier"
            type="email"
            placeholder="tu@email.com"
            value={formData.identifier}
            onChange={handleInputChange}
            className="pl-10"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            className="pl-10 pr-10"
            required
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>

      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        size="invisible"
      />
    </form>
  );
}
