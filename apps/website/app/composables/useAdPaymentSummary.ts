import { computed } from "vue";
import { useAdStore } from "@/stores/ad.store";
import { usePacksStore } from "@/stores/packs.store";

export const useAdPaymentSummary = () => {
  const adStore = useAdStore();
  const packsStore = usePacksStore();

  const FEATURED_PRICE = 10000;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(price);

  const selectedPack = computed(() => {
    if (typeof adStore.pack !== "number") return null;
    return packsStore.packs.find((p) => p.id === adStore.pack) || null;
  });

  const packPart = computed(() => {
    const pack = adStore.pack;

    if (pack === "free") {
      return {
        label: "1 anuncio gratuito",
        amount: 0,
      };
    }

    if (pack === "paid") {
      return {
        label: "1 anuncio ya pagado",
        amount: 0,
      };
    }

    if (selectedPack.value) {
      const p = selectedPack.value as any;
      const totalAds =
        typeof p.total_ads === "string"
          ? Number.parseInt(p.total_ads, 10)
          : p.total_ads;
      const unidad = totalAds === 1 ? "anuncio" : "anuncios";

      return {
        label: `${p.total_ads} ${unidad} x ${formatPrice(p.price)}`,
        amount: p.price,
      };
    }

    return null;
  });

  const featuredPart = computed(() => {
    const featured = adStore.featured;

    if (featured === "free") {
      return {
        label: " + destacado gratis",
        amount: 0,
      };
    }

    if (featured === true) {
      return {
        label: ` + destacado x ${formatPrice(FEATURED_PRICE)}`,
        amount: FEATURED_PRICE,
      };
    }

    return {
      label: "",
      amount: 0,
    };
  });

  const totalAmount = computed(() => {
    if (!packPart.value) return 0;

    const rawPackAmount = packPart.value.amount ?? 0;
    const rawFeaturedAmount = featuredPart.value?.amount ?? 0;

    const packAmount =
      typeof rawPackAmount === "string"
        ? Number.parseInt(rawPackAmount, 10)
        : rawPackAmount;

    const featuredAmount =
      typeof rawFeaturedAmount === "string"
        ? Number.parseInt(rawFeaturedAmount, 10)
        : rawFeaturedAmount;

    return (packAmount || 0) + (featuredAmount || 0);
  });

  const hasToPay = computed(() => totalAmount.value > 0);

  const paymentSummaryText = computed(() => {
    if (!packPart.value) return "";

    let text = packPart.value.label;

    if (featuredPart.value?.label) {
      text += featuredPart.value.label;
    }

    return text;
  });

  return {
    packPart,
    featuredPart,
    totalAmount,
    hasToPay,
    paymentSummaryText,
  };
};
