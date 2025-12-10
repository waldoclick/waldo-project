import { Avatar } from '@/components/ui/avatar';
import { useUserStore } from '@/stores/users';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { config } from '@/lib/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user } = useUserStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // const router = useRouter(); // Comentado hasta que se necesite

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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 capitalize">
            {new Date().toLocaleDateString('es-CL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50"
            >
              <Avatar name={userName} size="sm" />
              <span className="text-sm font-medium text-gray-700">
                {userName}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'admin@waldo.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center">
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
      </div>

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
    </header>
  );
}
