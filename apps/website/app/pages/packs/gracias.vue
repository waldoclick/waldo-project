<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <!-- <pre>{{ data }}</pre> -->
    <MessageDefault
      v-if="packData"
      type="success"
      title="¡Gracias por tu compra!"
      :description="`Has comprado el pack <strong>${
        packData.name
      }</strong> por <strong>${formatPrice(
        packData.price,
      )}</strong>. Este pack incluye <strong>${
        packData.total_ads
      }</strong> anuncios.`"
      button_label="Crear un anuncio"
      button_link="/anunciar"
      :button_show="true"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
const { $setSEO, $setStructuredData } = useNuxtApp();
const route = useRoute();
const config = useRuntimeConfig();
const router = useRouter();

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import MessageDefault from "@/components/MessageDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import type { Pack } from "@/types/pack";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const handleError = (type: "INVALID_URL" | "NOT_FOUND") => {
  const errorMessages = {
    INVALID_URL: {
      message: "Pack no encontrado",
      description: "No pudimos encontrar el pack que buscas",
    },
    NOT_FOUND: {
      message: "Pack no encontrado",
      description: "No pudimos encontrar el pack que buscas",
    },
  };

  const errorConfig = errorMessages[type] || errorMessages.NOT_FOUND;

  showError({
    statusCode: 404,
    ...errorConfig,
  });
};

const strapi = useStrapi();
const { data, pending, error } = await useAsyncData<Pack | { error: string }>(
  "packs-gracias-pack",
  async () => {
    if (!route.query.pack) {
      return { error: "INVALID_URL" };
    }

    const response = await strapi.find("ad-packs", {
      filters: { id: { $eq: route.query.pack } } as unknown as Record<
        string,
        unknown
      >,
      populate: "*",
    } as unknown as Record<string, unknown>);
    const pack = response.data?.[0] as unknown as Pack | undefined;

    if (!pack) {
      return { error: "NOT_FOUND" };
    }

    return pack as unknown as Pack;
  },
  {
    server: true,
    lazy: false,
  },
);

// Manejar errores con watchEffect
watchEffect(() => {
  if (data.value && "error" in data.value) {
    handleError(data.value.error as "INVALID_URL" | "NOT_FOUND");
  }
});

const packData = computed(() => {
  if (!data.value || "error" in data.value) return null;
  return data.value as Pack;
});

useSeoMeta({ robots: "noindex, nofollow" });

watch(data, (newData) => {
  if (newData && !("error" in newData)) {
    const pack = newData as Pack;
    $setSEO({
      title: `Gracias por tu Compra - ${pack.name}`,
      description: `Has comprado el pack ${pack.name} por ${formatPrice(
        pack.price,
      )}. Este pack incluye ${pack.total_ads} anuncios.`,
      imageUrl: `${config.public.baseUrl}/share.jpg`,
      url: `${config.public.baseUrl}/packs/gracias?pack=${pack.id}`,
    });

    $setStructuredData({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Gracias por tu Compra - ${pack.name} - Waldo.click®`,
      url: `${config.public.baseUrl}/packs/gracias?pack=${pack.id}`,
      description: `Has comprado el pack ${pack.name} por ${formatPrice(
        pack.price,
      )}. Este pack incluye ${pack.total_ads} anuncios.`,
    });
  }
});

definePageMeta({
  middleware: "auth",
});
</script>
