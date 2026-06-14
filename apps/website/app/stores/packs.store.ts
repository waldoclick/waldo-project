// stores/packs.store.ts

import { defineStore } from "pinia";
import type { Pack } from "@/types/pack";
import type { StrapiResponse } from "@/types/strapi";
import { useApiClient } from "@/composables/useApiClient";

export const usePacksStore = defineStore("packs", {
  state: () => ({
    packs: [] as Pack[],
  }),

  actions: {
    async loadPacks() {
      const client = useApiClient();
      const response = await client<StrapiResponse<Pack>>("ad-packs", {
        method: "GET",
        params: { populate: "*" } as unknown as Record<string, unknown>,
      });
      this.packs = (response as StrapiResponse<Pack>).data as unknown as Pack[];
    },

    async getPackById(id: string | number) {
      const client = useApiClient();
      const response = await client<StrapiResponse<Pack>>("ad-packs", {
        method: "GET",
        params: {
          filters: { documentId: { $eq: id } },
          populate: "*",
        } as unknown as Record<string, unknown>,
      });
      return (response as StrapiResponse<Pack>).data?.[0];
    },
  },
});
