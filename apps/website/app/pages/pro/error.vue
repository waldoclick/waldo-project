<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <MessageDefault
      type="fail"
      :title="errorTitle"
      :description="errorDescription"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
const { $setSEO } = useNuxtApp();
const config = useRuntimeConfig();

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import MessageDefault from "@/components/MessageDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import { computed } from "vue";

$setSEO({
  title: "Error en inscripcion PRO",
  description: "Hubo un problema al registrar tu tarjeta en Waldo.click.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/pro/error`,
});
useSeoMeta({ robots: "noindex, nofollow" });

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const reason = computed(() => route.query.reason as string | undefined);

const errorTitle = computed(() => {
  if (reason.value === "cancelled") return "Inscripcion cancelada";
  if (reason.value === "rejected") return "Inscripcion rechazada";
  if (reason.value === "charge-failed") return "Error en el cobro";
  return "Error en la inscripcion";
});

const errorDescription = computed(() => {
  if (reason.value === "cancelled")
    return "Cancelaste el registro de tu tarjeta. Puedes intentarlo nuevamente desde tu cuenta.";
  if (reason.value === "rejected")
    return "No se pudo registrar tu tarjeta. Verifica los datos e intenta nuevamente.";
  if (reason.value === "charge-failed")
    return "Tu tarjeta fue registrada pero no se pudo realizar el cobro del primer mes. Puedes intentarlo nuevamente desde tu cuenta.";
  return "Ocurrio un problema al registrar tu tarjeta. Por favor, intenta de nuevo mas tarde.";
});
</script>
