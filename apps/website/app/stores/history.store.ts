import { defineStore } from "pinia";

interface HistoryAd {
  id: number;
  title: string;
  slug: string;
  url: string;
  price: number;
  image: string; // URL de la imagen principal
  createdAt: string; // Para ordenar por fecha de visita
}

interface HistoryState {
  viewedAds: HistoryAd[];
  maxHistory: number; // Número máximo de anuncios a guardar
}

export const useHistoryStore = defineStore("history", {
  state: (): HistoryState => ({
    viewedAds: [],
    maxHistory: 10, // Guardamos los últimos 10 anuncios vistos
  }),

  getters: {
    // Obtener anuncios ordenados por fecha de visita (más recientes primero)
    getRecentlyViewed: (state) => {
      return [...state.viewedAds].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
  },

  actions: {
    addToHistory(ad: Omit<HistoryAd, "createdAt">) {
      // Verificar si el anuncio ya existe
      const existingIndex = this.viewedAds.findIndex(
        (item) => item.id === ad.id,
      );

      if (existingIndex !== -1) {
        // Si existe, actualizamos su fecha
        this.viewedAds[existingIndex] = {
          ...ad,
          createdAt: new Date().toISOString(),
        };
      } else {
        // Si no existe, lo agregamos
        this.viewedAds.push({
          ...ad,
          createdAt: new Date().toISOString(),
        });

        // Si excedemos el máximo, removemos el más antiguo
        if (this.viewedAds.length > this.maxHistory) {
          this.viewedAds = this.viewedAds
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, this.maxHistory);
        }
      }
    },

    clearHistory() {
      this.viewedAds = [];
    },

    removeFromHistory(adId: number) {
      this.viewedAds = this.viewedAds.filter((ad) => ad.id !== adId);
    },
  },

  persist: {
    storage: persistedState.localStorage,
  },
});
