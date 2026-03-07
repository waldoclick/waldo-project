// stores/packs.store.ts

import { defineStore } from "pinia";
import type { Pack } from "@/types/pack";

export const usePacksStore = defineStore("packs", {
  state: () => ({
    packs: [] as Pack[],
    lastFetch: 0,
  }),

  actions: {
    async loadPacks() {
      const now = Date.now();
      if (this.packs.length > 0 && now - this.lastFetch < 1800000) return;

      const strapi = useStrapi();
      const response = await strapi.find("ad-packs", {
        populate: "*",
      });
      this.packs = response.data as unknown as Pack[];
      this.lastFetch = Date.now();
    },

    async getPackById(id: string | number) {
      const strapi = useStrapi();
      const response = await strapi.find("ad-packs", {
        filters: { id: { $eq: id } },
        populate: "*",
      } as unknown as Record<string, unknown>);
      return response.data?.[0];
    },
  },

  // persist: CORRECT — static reference data with 30-min cache TTL (lastFetch); safe to reuse across sessions
  persist: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
  },
});
