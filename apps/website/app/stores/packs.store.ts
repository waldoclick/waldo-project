// stores/packs.store.ts

import { defineStore } from "pinia";
import type { Pack } from "@/types/pack";

export const usePacksStore = defineStore("packs", {
  state: () => ({
    packs: [] as Pack[],
  }),

  actions: {
    async loadPacks() {
      const strapi = useStrapi();
      const response = await strapi.find("ad-packs", {
        populate: "*",
      });
      this.packs = response.data as unknown as Pack[];
    },

    async getPackById(id: string | number) {
      const strapi = useStrapi();
      const response = await strapi.find("ad-packs", {
        filters: { id: { $eq: id } },
        populate: "*",
      });
      return response.data?.[0];
    },
  },
});
