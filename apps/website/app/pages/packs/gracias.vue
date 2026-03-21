<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <!-- <pre>{{ data }}</pre> -->
    <MessageDefault
      v-if="data"
      type="success"
      title="¡Gracias por tu compra!"
      :description="`Has comprado el pack <strong>${
        data.name
      }</strong> por <strong>${formatPrice(
        data.price,
      )}</strong>. Este pack incluye <strong>${
        data.total_ads
      }</strong> anuncios.`"
      button_label="Crear un anuncio"
      button_link="/anunciar"
      :button_show="true"
    />
    <FooterDefault />
  </div>
</template>

<script setup>
const { $setSEO, $setStructuredData } = useNuxtApp();
const route = useRoute();
const packsStore = usePacksStore();
const router = useRouter();

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import MessageDefault from "@/components/MessageDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import { usePacksStore } from "@/stores/packs.store";

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const handleError = (type) => {
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

const { data, pending, error } = await useAsyncData(
  "packData",
  async () => {
    if (!route.query.pack) {
      return { error: "INVALID_URL" };
    }

    const packsStore = usePacksStore();
    const pack = await packsStore.getPackById(route.query.pack);

    if (!pack) {
      return { error: "NOT_FOUND" };
    }

    return pack;
  },
  {
    server: true,
    lazy: false,
  },
);

// Manejar errores con watchEffect
watchEffect(() => {
  if (data.value?.error) {
    handleError(data.value.error);
  }
});

watch(data, (newData) => {
  if (newData) {
    $setSEO({
      title: `Gracias por tu Compra - ${newData.name}`,
      description: `Has comprado el pack ${newData.name} por ${formatPrice(
        newData.price,
      )}. Este pack incluye ${newData.ads_count} anuncios.`,
      imageUrl: "https://waldo.click/share.jpg",
      url: `https://waldo.click/packs/gracias?pack=${newData.id}`,
    });

    $setStructuredData({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Gracias por tu Compra - ${newData.name} - Waldo.click®`,
      url: `https://waldo.click/packs/gracias?pack=${newData.id}`,
      description: `Has comprado el pack ${newData.name} por ${formatPrice(
        newData.price,
      )}. Este pack incluye ${newData.ads_count} anuncios.`,
    });
  }
});

definePageMeta({
  middleware: "auth",
});
</script>
