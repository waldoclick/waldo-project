import { ref, readonly } from "vue";
import type { Pack } from "@/types/pack";

const _packs = ref<Pack[]>([]);

export const usePacksList = () => {
  const client = useApiClient();

  const loadPacks = async () => {
    const response = (await client("ad-packs", {
      method: "GET",
      params: { populate: "*" } as unknown as Record<string, unknown>,
    })) as { data: Pack[] };
    _packs.value = response.data;
  };

  return {
    packs: readonly(_packs),
    loadPacks,
  };
};
