<template>
  <div class="onboarding onboarding--thankyou">
    <div class="onboarding--thankyou__content">
      <h1 class="onboarding--thankyou__title title">
        Muchas gracias por registrarte
      </h1>
      <p class="onboarding--thankyou__text paragraph">
        Tu perfil esta completo. Ya puedes publicar tu primer anuncio en
        Waldo.click&reg; y comenzar a conectar con compradores y vendedores.
      </p>
      <div class="onboarding--thankyou__actions">
        <NuxtLink to="/anunciar" class="btn btn--primary btn--block"
          >Crear mi primer anuncio</NuxtLink
        >
        <NuxtLink :to="returnUrl" class="btn btn--secondary btn--block"
          >Volver a Waldo</NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const appStore = useAppStore();
const returnUrl = computed(() => appStore.getReferer || "/");
</script>
