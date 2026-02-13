import { useCommunesStore } from "@/stores/communes.store";

export default defineNuxtPlugin(async (nuxtApp) => {
  // Solo cargar en el cliente
  if (import.meta.client) {
    const communesStore = useCommunesStore();
    // Cargar las comunas si no hay datos
    if (communesStore.communes.data.length === 0) {
      await communesStore.loadCommunes();
    }
  }
});
