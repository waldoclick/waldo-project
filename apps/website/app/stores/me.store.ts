import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "@/types/user";

export const useMeStore = defineStore("me", () => {
  const me = ref<User | null>(null);

  const strapi = useStrapi();
  const apiClient = useApiClient();

  const loadMe = async () => {
    try {
      const response = await strapi.find("users/me", {
        populate: {
          commune: {
            populate: "region",
          },
        },
      });
      me.value = response as unknown as User; // Strapi SDK v5: find returns ResponseMany, cast to User
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
      const response = await apiClient("/api/users/username", {
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
