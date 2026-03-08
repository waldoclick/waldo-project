<template>
  <div class="page">
    <HeaderDefault />
    <section class="create create--announcement">
      <div class="create--announcement__container">
        <ClientOnly>
          <div class="create--announcement__steps">
            <div class="step step--5">
              <FormCreateFive
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
  title: "Crear Anuncio - Galería de Imágenes",
  description:
    "Sube las imágenes de tu producto para completar la publicación de tu anuncio en Waldo.click®.",
});
useSeoMeta({ robots: "noindex, nofollow" });

definePageMeta({
  middleware: "auth",
});

onMounted(() => {
  adStore.updateStep(5);
  adAnalytics.stepView(5, "Image Gallery");
});

function handleFormSubmitted() {
  adStore.updateStep(5);
  router.push("/anunciar/resumen");
}

function handleFormBack() {
  adStore.updateStep(4);
  router.push("/anunciar/ficha-de-producto");
}
</script>
