'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/users';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  LogOut,
  User,
  Settings,
  Mail,
  Edit,
  Lock,
  Menu,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { config } from '@/lib/config';

export function UserMenu() {
  const { user } = useUserStore();
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [open, setOpen] = useState(false);

  const firstName = user?.firstname;
  const lastName = user?.lastname;

  // Match website trigger content: "Hola" + firstname (fallback to username/email)
  const displayName =
    firstName || user?.username || user?.email?.split('@')[0] || 'Usuario';

  // Match website avatar fallback: firstname+lastname -> initials, else email -> 2 chars
  const avatarSeed =
    firstName || lastName
      ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
      : user?.email || user?.username || 'WA';

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
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Menú de usuario"
            className={[
              'appearance-none border bg-[#f5f5f5] border-white',
              'shadow-[0_0_20px_rgba(49,51,56,0.1)]',
              'px-[10px] py-[7px] min-w-[220px]',
              'flex items-center justify-between',
              'outline-none focus-visible:outline-none',
              open ? 'rounded-t-[4px] rounded-b-none' : 'rounded-[4px]',
            ].join(' ')}
          >
            <div className="flex items-center">
              <div className="max-w-[30px] mr-[10px]">
                <Avatar name={avatarSeed} size="sm" />
              </div>

              <div className="text-left text-[10px] leading-none text-[#313338] font-normal">
                Hola
                <div className="font-semibold text-[14px] leading-[1.3] text-[#313338] w-[130px] truncate">
                  {displayName}
                </div>
              </div>
            </div>

            <div className="w-5 h-5 ml-[10px] text-[#313338]">
              {open ? <X size={24} /> : <Menu size={24} />}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={0}
          className="w-[220px] min-w-[220px] p-0 border-none rounded-tl-none rounded-tr-none rounded-bl-[4px] rounded-br-[4px] bg-white shadow-[0_10px_20px_rgba(49,51,56,0.1)]"
        >
          <div className="px-5 py-[10px] flex flex-col">
            <DropdownMenuItem asChild className="px-0">
              <Link
                href="/profile"
                className={`text-sm text-[#313338] py-[5px] hover:underline focus:bg-transparent focus:text-[#313338] focus:underline outline-none cursor-pointer h-auto ${pathname === '/profile' ? 'underline font-semibold' : ''}`}
              >
                Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="px-0">
              <Link
                href="/profile/change-password"
                className={`text-sm text-[#313338] py-[5px] hover:underline focus:bg-transparent focus:text-[#313338] focus:underline outline-none cursor-pointer h-auto ${pathname === '/profile/change-password' ? 'underline font-semibold' : ''}`}
              >
                Cambiar contraseña
              </Link>
            </DropdownMenuItem>
          </div>

          <div className="h-[1px] bg-[#eaebeb] w-full" />

          <div className="px-5 py-[10px] flex flex-col">
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-sm text-[#313338] py-[5px] hover:underline focus:bg-transparent focus:text-[#313338] focus:underline cursor-pointer h-auto outline-none px-0"
            >
              Cerrar sesión
            </DropdownMenuItem>
          </div>
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
