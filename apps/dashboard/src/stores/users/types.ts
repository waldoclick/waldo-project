import { StrapiUser } from '@/lib/strapi';

export interface UserState {
  // Estado del usuario
  user: StrapiUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones
  setUser: (user: StrapiUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: StrapiUser, token: string) => void;
  logout: () => void;
  clearUser: () => void;
}
