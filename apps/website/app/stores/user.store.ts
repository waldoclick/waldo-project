import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "@/types/user";
import type { Ad } from "@/types/ad";

export const useUserStore = defineStore("user", () => {
  const users = ref<User[]>([]);
  const user = ref<User | null>(null);
  const ads = ref<Ad[]>([]);

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
      const response = await client("users", {
        method: "GET",
        params: {
          pagination: { pageSize: 20, page: 1 },
          populate: "*",
        } as unknown as Record<string, unknown>,
      });
      users.value = (response as unknown as { data: User[] })
        .data as unknown as User[];
    } catch {
      // Error handling logic can be added here if needed
    }
  };

  const loadUser = async (slug: string) => {
    try {
      const response = await client("users", {
        method: "GET",
        params: {
          filters: {
            username: {
              $eq: slug,
            },
          },
          populate: "*",
        } as unknown as Record<string, unknown>,
      });

      const rawList = response as unknown as { data: User[] } | User[];
      const userList = (
        Array.isArray(rawList) ? rawList : (rawList as { data: User[] }).data
      ) as User[];
      user.value = userList?.[0] ?? null;
    } catch {
      user.value = null;
    }
  };

  const STATUS_ENDPOINT_MAP: Record<string, string> = {
    published: "ads/actives",
    review: "ads/pendings",
    expired: "ads/archiveds",
    rejected: "ads/rejecteds",
    banned: "ads/banneds",
  };

  const loadUserAds = async (
    status: string,
    pagination = DEFAULT_PAGINATION,
    sort = [],
  ): Promise<{
    data: Ad[];
    meta: { pagination: { total: number } };
  } | null> => {
    const endpoint = STATUS_ENDPOINT_MAP[status];
    if (!endpoint) {
      console.error(`Unknown ad status: ${status}`);
      return null;
    }
    try {
      const response = await client(endpoint, {
        method: "GET",
        params: {
          pagination,
          sort,
          populate: "*",
        } as unknown as Record<string, unknown>,
      });
      const typed = response as unknown as {
        data: Ad[];
        meta: { pagination: { total: number } };
      };
      ads.value = typed.data as unknown as Ad[];
      return typed;
    } catch {
      ads.value = [];
      return null;
    }
  };

  const loadUserOrders = async (
    filters = {},
    pagination = DEFAULT_ORDER_PAGINATION,
    sort = [],
  ): Promise<{
    data: Record<string, unknown>[];
    meta: { pagination: { total: number } };
  } | null> => {
    try {
      const response = await client("orders/me", {
        method: "GET",
        params: {
          filters,
          pagination,
          sort,
          populate: "*",
        } as unknown as Record<string, unknown>,
      });
      return response as unknown as {
        data: Record<string, unknown>[];
        meta: { pagination: { total: number } };
      };
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
      const response = await client("ads/count", { method: "GET" });
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
