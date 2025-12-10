import { defineStore } from "pinia";
import { ref } from "vue";

export const useMeStore = defineStore("me", () => {
  const me = ref(null);

  const strapi = useStrapi();

  const loadMe = async () => {
    try {
      const response = await strapi.find("users/me", {
        populate: {
          commune: {
            populate: "region",
          },
        },
      });
      me.value = response; // Asegurarse de asignar correctamente los datos
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
      if (
        me.value[field] === undefined ||
        me.value[field] === null ||
        me.value[field] === ""
      ) {
        return false;
      }
    }

    return true;
  };

  const saveUsername = async (data: any) => {
    try {
      const response = await strapi.update("users/username", data);
      return response;
    } catch (error) {
      console.error("Error al guardar el username:", error);
      throw error;
    }
  };

  return {
    me,
    loadMe,
    isProfileComplete,
    saveUsername,
  };
});
