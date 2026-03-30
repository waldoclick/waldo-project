import { useRuntimeConfig } from "#imports";
import type { User } from "@/types/user";

export const useSessionAuth = () => {
  const token = useSessionToken();
  const user = useSessionUser<User>();
  const client = useSessionClient();
  const config = import.meta.server
    ? useRuntimeConfig()
    : useRuntimeConfig().public;

  const setToken = (value: string | null): void => {
    token.value = value;
  };

  const fetchUser = async (): Promise<typeof user> => {
    if (token.value) {
      try {
        user.value = await client<User>("/users/me", {
          params: config.strapi.auth as Record<string, unknown>,
        });
      } catch {
        setToken(null);
      }
    }
    return user;
  };

  const logout = (): void => {
    setToken(null);
    user.value = null;
  };

  return { setToken, fetchUser, logout };
};
