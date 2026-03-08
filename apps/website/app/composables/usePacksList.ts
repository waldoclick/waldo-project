import { ref, readonly } from "vue";
import type { Pack } from "@/types/pack";

const _packs = ref<Pack[]>([]);
let _lastFetch = 0;
const TTL = 1_800_000;

export const usePacksList = () => {
  const strapi = useStrapi();

  const loadPacks = async () => {
    const now = Date.now();
    if (_packs.value.length > 0 && now - _lastFetch < TTL) return;
    const response = await strapi.find("ad-packs", { populate: "*" });
    _packs.value = response.data as unknown as Pack[];
    _lastFetch = Date.now();
  };

  return {
    packs: readonly(_packs),
    loadPacks,
  };
};
