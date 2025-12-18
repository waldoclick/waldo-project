import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/users';
import { useEffect } from 'react';

export function useAuthMiddleware() {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      console.log('AuthMiddleware - No authenticated, redirecting to login');
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
}
