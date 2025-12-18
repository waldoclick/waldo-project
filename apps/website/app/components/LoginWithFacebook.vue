<template>
  <!-- {{ isFacebookEnabled }} -->
  <button
    title="Iniciar sesión con facebook"
    type="button"
    class="btn btn--primary btn--block btn--facebook"
    @click="onClick"
  >
    <NuxtImg
      loading="lazy"
      decoding="async"
      src="/images/icon-facebook.svg"
      alt="icono de facebook"
      title="icono de facebook"
    />
    <span>Ingresa con facebook</span>
  </button>
</template>

<script setup lang="ts">
// Usar el composable de providers
const { redirectToProvider } = useProviders();

const onClick = () => {
  redirectToProvider("facebook");
};
</script>
