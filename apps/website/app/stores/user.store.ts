import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "@/types/user";
import type { Ad } from "@/types/ad";

export const useUserStore = defineStore("user", () => {
  const users = ref<User[]>([]);
  const user = ref<User | null>(null);
  const ads = ref<Ad[]>([]);

  const strapi = useStrapi();
  const client = useApiClient();

  const DEFAULT_PAGINATION = {
    page: 1,
    pageSize: 20,
  };

  const DEFAULT_ORDER_PAGINATION = {
    page: 1,
    pageSize: 10,
  };

  const loadUsers = async () => {
    try {
      const response = await strapi.find("users", {
        pagination: {
          pageSize: 20,
          page: 1,
        },
        populate: "*",
      });
      users.value = response.data as unknown as User[];
    } catch {
      // Error handling logic can be added here if needed
    }
  };

  const loadUser = async (slug: string) => {
    try {
      const response = await strapi.find("users", {
        filters: {
          username: {
            $eq: slug,
          },
        } as any,
        populate: "*",
      });

      const list = (response.data ?? response) as unknown as User[];
      user.value = list?.[0] ?? null;
    } catch {
      user.value = null;
    }
  };

  const loadUserAds = async (
    filters = {},
    pagination = DEFAULT_PAGINATION,
    sort = [],
  ) => {
    try {
      const response = await strapi.find("ads/me", {
        filters,
        pagination,
        sort, // Pasar el sort como un parámetro separado
        populate: "*",
      });
      ads.value = response.data as unknown as Ad[];
      return response;
    } catch {
      ads.value = [];
      return null;
    }
  };

  const loadUserOrders = async (
    filters = {},
    pagination = DEFAULT_ORDER_PAGINATION,
    sort = [],
  ) => {
    try {
      const response = await strapi.find("orders/me", {
        filters,
        pagination,
        sort,
        populate: "*",
      });
      return response;
    } catch {
      return null;
    }
  };

  const updateUserProfile = async (
    userId: string,
    userData: Record<string, unknown>,
  ) => {
    try {
      // Verificar si los datos vienen envueltos en 'data' y extraerlos
      const dataToSend = userData.data ? userData.data : userData;

      const response = await client(`/users/${userId}`, {
        method: "PUT",
        body: dataToSend as Record<string, unknown>,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  const loadUserAdCounts = async (): Promise<{
    published: number;
    review: number;
    expired: number;
    rejected: number;
    banned: number;
  }> => {
    try {
      const response = await strapi.find("ads/me/counts", {});
      return response as unknown as {
        published: number;
        review: number;
        expired: number;
        rejected: number;
        banned: number;
      };
    } catch {
      return { published: 0, review: 0, expired: 0, rejected: 0, banned: 0 };
    }
  };

  const deactivateAd = async (adDocumentId: string, reason?: string) => {
    try {
      const response = await client(`ads/${adDocumentId}/deactivate`, {
        method: "PUT",
        body: { reason_for_deactivation: reason ?? null },
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  const reset = () => {
    users.value = [];
    user.value = null;
    ads.value = [];
  };

  return {
    users,
    user,
    ads,
    loadUsers,
    loadUser,
    loadUserAds,
    loadUserAdCounts,
    loadUserOrders,
    updateUserProfile,
    deactivateAd,
    reset,
  };
});
