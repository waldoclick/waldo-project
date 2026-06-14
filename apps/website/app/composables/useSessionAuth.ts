import type { User } from "@/types/user";
export const useSessionAuth = () => {
  const user = useSessionUser();

  const fetchUser = async (): Promise<User | null> => {
    try {
      const client = useApiClient();
      const result = await client<User>("users/me", {
        params: {
          populate: [
            "role",
            "commune",
            "region",
            "business_region",
            "business_commune",
          ],
        },
      });
      user.value = result;
      return result;
    } catch {
      // CRITICAL: 401 = anonymous. Set null only. NEVER touch any cookie/token here.
      user.value = null;
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
  };

  const getProviderAuthenticationUrl = (provider: string): string => {
    const config = useRuntimeConfig();
    return `${(config.public as { baseUrl: string }).baseUrl}/api/connect/${provider}`;
  };

  return { fetchUser, logout, getProviderAuthenticationUrl };
};
