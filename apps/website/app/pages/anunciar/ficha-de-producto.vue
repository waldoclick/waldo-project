<template>
  <div class="page">
    <HeaderDefault />
    <section class="create create--announcement">
      <div class="create--announcement__container">
        <ClientOnly>
          <div class="create--announcement__steps">
            <div class="step step--4">
              <FormCreateFour
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
  title: "Crear Anuncio - Ficha de Producto",
  description:
    "Completa la ficha técnica de tu producto para publicar tu anuncio en Waldo.click®.",
});
useSeoMeta({ robots: "noindex, nofollow" });

definePageMeta({
  middleware: ["auth", "wizard-guard"],
});

onMounted(() => {
  adStore.updateStep(4);
  adAnalytics.stepView(4, "Product Sheet");
});

function handleFormSubmitted() {
  adStore.updateStep(5);
  router.push("/anunciar/galeria-de-imagenes");
}

function handleFormBack() {
  adStore.updateStep(3);
  router.push("/anunciar/datos-personales");
}
</script>
