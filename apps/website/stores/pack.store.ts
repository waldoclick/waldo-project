import { defineStore } from "pinia";
import type { PackSelectionState } from "@/types/pack";

export const usePackStore = defineStore("pack", {
  state: (): PackSelectionState => ({
    pack: 1, // Por defecto, pack es 1
    is_invoice: false, // Por defecto, boleta (false)
  }),

  getters: {
    getPack: (state) => state.pack,
    getIsInvoice: (state) => state.is_invoice,
  },

  actions: {
    updatePack(newPack: number) {
      this.pack = newPack;
    },

    updateIsInvoice(newIsInvoice: boolean) {
      this.is_invoice = newIsInvoice;
    },
  },

  persist: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
  },
});
