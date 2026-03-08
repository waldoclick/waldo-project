<template>
  <div class="page">
    <HeaderDefault />
    <section class="create create--announcement">
      <div class="create--announcement__container">
        <ClientOnly>
          <div class="create--announcement__steps">
            <div class="step step--3">
              <FormCreateThree
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
  title: "Crear Anuncio - Datos Personales",
  description:
    "Ingresa tus datos personales para publicar tu anuncio en Waldo.click®.",
});
useSeoMeta({ robots: "noindex, nofollow" });

definePageMeta({
  middleware: "auth",
});

onMounted(() => {
  adStore.updateStep(3);
  adAnalytics.stepView(3, "Personal Information");
});

function handleFormSubmitted() {
  router.push("/anunciar/ficha-de-producto");
}

function handleFormBack() {
  router.push("/anunciar/datos-del-producto");
}
</script>
