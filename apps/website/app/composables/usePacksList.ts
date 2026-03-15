import { ref, readonly } from "vue";
import type { Pack } from "@/types/pack";

const _packs = ref<Pack[]>([]);
let _lastFetch = 0;
const TTL = 1_800_000;

export const usePacksList = () => {
  const client = useApiClient();

  const loadPacks = async () => {
    const now = Date.now();
    if (_packs.value.length > 0 && now - _lastFetch < TTL) return;
    const response = (await client("ad-packs", {
      method: "GET",
      params: { populate: "*" } as unknown as Record<string, unknown>,
    })) as { data: Pack[] };
    _packs.value = response.data;
    _lastFetch = Date.now();
  };

  return {
    packs: readonly(_packs),
    loadPacks,
  };
};
