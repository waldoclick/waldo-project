import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "@/types/user";
import type { Ad } from "@/types/ad";

export const useUserStore = defineStore("user", () => {
  const users = ref<User[]>([]);
  const user = ref<User | null>(null);
  const ads = ref<Ad[]>([]);

  const strapi = useStrapi();

  // Obtener la configuración para usar en las funciones
  const config = useRuntimeConfig();

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

  const loadUser = async (slug: any) => {
    try {
      const response = await strapi.find("users", {
        filters: {
          username: {
            $eq: slug,
          },
        },
        populate: "*",
      });

      user.value = response.data ? (response.data[0] as unknown as User) : null;
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

  const updateUserProfile = async (userId: string, userData: any) => {
    try {
      // Obtener el token JWT
      const token = useCookie("strapi_jwt").value;

      // Verificar si los datos vienen envueltos en 'data' y extraerlos
      const dataToSend = userData.data ? userData.data : userData;

      // Usar la URL correcta según el entorno
      const apiUrl =
        process.env.API_DISABLE_PROXY === "true"
          ? config.public.apiUrl
          : config.public.baseUrl;

      const response = await $fetch(`${apiUrl}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: dataToSend,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  const deactivateAd = async (adId: number) => {
    try {
      // Obtener el token JWT
      const token = useCookie("strapi_jwt").value;

      // Usar la URL correcta según el entorno
      const apiUrl =
        process.env.API_DISABLE_PROXY === "true"
          ? config.public.apiUrl
          : config.public.baseUrl;

      const response = await $fetch(`${apiUrl}/api/ads/${adId}/deactivate`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    users,
    user,
    ads,
    loadUsers,
    loadUser,
    loadUserAds,
    loadUserOrders,
    updateUserProfile,
    deactivateAd,
  };
});
