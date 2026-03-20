<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <ResumePro
      v-if="proData"
      title="Tu suscripcion PRO esta activa"
      description="Tu tarjeta ha sido registrada exitosamente. Ya puedes disfrutar de todos los beneficios PRO."
      :show-icon="true"
      :summary="proData"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
const { $setSEO } = useNuxtApp();
const config = useRuntimeConfig();

import { computed } from "vue";
import type { User } from "@/types/user";

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import ResumePro from "@/components/ResumePro.vue";
import FooterDefault from "@/components/FooterDefault.vue";

$setSEO({
  title: "Suscripcion PRO Confirmada",
  description:
    "Tu suscripcion PRO ha sido activada exitosamente en Waldo.click.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/pro/gracias`,
});
useSeoMeta({ robots: "noindex, nofollow" });

definePageMeta({
  middleware: "auth",
});

const user = useStrapiUser<User>();

if (import.meta.client) {
  const { fetchUser } = useStrapiAuth();
  await fetchUser();
}

if (user.value?.pro_status !== "active") {
  await navigateTo("/cuenta");
}

const proData = computed(() => {
  if (!user.value) return null;
  return {
    cardType: user.value.pro_card_type,
    cardLast4: user.value.pro_card_last4,
  };
});
</script>

<style scoped></style>
