import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "@/types/user";

export const useMeStore = defineStore("me", () => {
  const me = ref<User | null>(null);

  const apiClient = useApiClient();

  const loadMe = async () => {
    try {
      const response = await apiClient("users/me", {
        method: "GET",
        params: {
          populate: {
            commune: {
              populate: "region",
            },
          },
        } as unknown as Record<string, unknown>,
      });
      me.value = response as unknown as User; // useApiClient returns raw body — /api/users/me returns the User object directly
    } catch (_error) {
      console.error("Error loading user data:", _error);
    }
  };

  const isProfileComplete = async () => {
    if (!me.value) {
      await loadMe();
    }

    if (!me.value) return false;

    const requiredFields = ["firstname", "lastname", "rut", "phone", "commune"];

    for (const field of requiredFields) {
      const value = (me.value as Record<string, unknown>)[field];
      if (value === undefined || value === null || value === "") {
        return false;
      }
    }

    return true;
  };

  const saveUsername = async (data: { username: string }) => {
    try {
      const response = await apiClient("users/username", {
        method: "PUT",
        body: data as Record<string, unknown>,
      });
      return response;
    } catch (error) {
      console.error("Error al guardar el username:", error);
      throw error;
    }
  };

  const reset = () => {
    me.value = null;
  };

  return {
    me,
    loadMe,
    isProfileComplete,
    saveUsername,
    reset,
  };
});
