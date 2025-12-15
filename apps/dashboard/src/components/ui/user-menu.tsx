'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/users';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  LogOut,
  User,
  Settings,
  ChevronDown,
  Mail,
  Edit,
  Lock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { config } from '@/lib/config';

export function UserMenu() {
  const { user } = useUserStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Obtener nombre del usuario
  const userName = user?.username || user?.email?.split('@')[0] || 'Usuario';

  const handleLogout = async () => {
    console.log('🔴 Botón de logout presionado');
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      console.log('Dashboard - Iniciando logout...');
      console.log('Dashboard - Cookies antes del logout:', document.cookie);

      // Limpiar todo inmediatamente
      const { logout: logoutStore } = useUserStore.getState();
      logoutStore();

      // Limpiar cookies manualmente
      document.cookie = `${config.authCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      document.cookie = `${config.authCookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${config.authCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${config.authCookieName}=; path=/; max-age=0; SameSite=Lax`;

      console.log('Dashboard - Logout completado, redirigiendo...');
      // Forzar recarga de la página para asegurar que el estado se limpie completamente
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50"
          >
            <Avatar name={userName} size="md" />
            <span className="text-sm font-medium text-gray-700">
              {userName}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal px-2 py-1.5">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500 shrink-0" />
              <span className="text-sm leading-none text-muted-foreground">
                {user?.email || 'admin@waldo.com'}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/edit" className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/change-password" className="flex items-center">
              <Lock className="mr-2 h-4 w-4" />
              <span>Cambiar Contraseña</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de confirmación */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Confirmar cierre de sesión
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres cerrar sesión?
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmLogout}
                className="flex-1"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
