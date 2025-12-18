<template>
  <button
    :title="'Iniciar sesión'"
    :class="`${linkClass} link link--login link--login--desktop`"
    role="button"
    @click.prevent="handleClick"
  >
    <span>Iniciar sesión</span>
  </button>
  <NuxtLink
    to="/login"
    :title="'Iniciar sesión'"
    :class="`${linkClass} link link--login link--login--mobile`"
    role="button"
  >
    <span>Iniciar sesión</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "@/stores/app.store";

const props = defineProps({
  linkClass: {
    type: String,
    default: "",
  },
});

const appStore = useAppStore();

const handleClick = (event: MouseEvent) => {
  event.preventDefault(); // Prevenir la redirección
  appStore.openLoginLightbox(); // Abrir el lightbox
};

const computedClass = computed(() => {
  return `btn btn--default btn--login ${props.linkClass}`;
});
</script>
