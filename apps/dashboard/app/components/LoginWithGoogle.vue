<template>
  <button
    title="Iniciar sesión con Google"
    type="button"
    class="btn btn--primary btn--block btn--google"
    @click="onClick"
  >
    <NuxtImg
      loading="lazy"
      decoding="async"
      src="/images/icon-google.svg"
      alt="icono de google"
      title="icono de google"
    />
    <span>Ingresa con Google</span>
  </button>
</template>

<script setup lang="ts">
// Usar el composable de providers
const { redirectToProvider } = useProviders();

const onClick = () => {
  redirectToProvider("google");
};
</script>
