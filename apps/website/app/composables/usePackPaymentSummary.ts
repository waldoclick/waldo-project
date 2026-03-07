import { computed } from "vue";
import { usePackStore } from "@/stores/pack.store";
import { usePacksStore } from "@/stores/packs.store";

export const usePackPaymentSummary = () => {
  const packStore = usePackStore();
  const packsStore = usePacksStore();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(price);

  const selectedPack = computed(() => {
    return packsStore.packs.find((p) => p.id === packStore.pack) || null;
  });

  const summaryText = computed(() => {
    if (!selectedPack.value) return "";

    const totalAds =
      typeof selectedPack.value.total_ads === "string"
        ? Number.parseInt(selectedPack.value.total_ads, 10)
        : selectedPack.value.total_ads;
    const unidad = totalAds === 1 ? "anuncio" : "anuncios";

    return `${selectedPack.value.total_ads} ${unidad} x ${formatPrice(selectedPack.value.price)}`;
  });

  return {
    selectedPack,
    summaryText,
  };
};
