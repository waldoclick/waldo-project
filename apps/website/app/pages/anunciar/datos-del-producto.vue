<template>
  <div class="page">
    <HeaderDefault />
    <section class="create create--announcement">
      <div class="create--announcement__container">
        <ClientOnly>
          <div class="create--announcement__steps">
            <div class="step step--2">
              <FormCreateTwo
                @form-submitted="handleFormSubmitted"
                @form-back="handleFormBack"
              />
            </div>
          </div>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import HeaderDefault from "@/components/HeaderDefault.vue";
import { useAdAnalytics } from "~/composables/useAdAnalytics";
import { useAdStore } from "@/stores/ad.store";

const router = useRouter();
const adAnalytics = useAdAnalytics();
const adStore = useAdStore();
const { $setSEO } = useNuxtApp();

$setSEO({
  title: "Crear Anuncio - Datos del Producto",
  description:
    "Ingresa los datos del producto que deseas publicar en Waldo.click®.",
});
useSeoMeta({ robots: "noindex, nofollow" });

definePageMeta({
  middleware: "auth",
});

onMounted(() => {
  adStore.updateStep(2);
  adAnalytics.stepView(2, "General");
});

function handleFormSubmitted() {
  router.push("/anunciar/datos-personales");
}

function handleFormBack() {
  router.push("/anunciar");
}
</script>
