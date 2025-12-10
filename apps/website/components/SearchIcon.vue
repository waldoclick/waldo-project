<template>
  <div class="search search--icon">
    <button title="Buscar" @click="handleOpenLightbox">
      <img
        v-if="white"
        loading="lazy"
        decoding="async"
        :src="iconZoomWhite"
        alt="icon-zoom"
        title="icon-zoom"
      />
      <img
        v-else
        loading="lazy"
        decoding="async"
        :src="iconZoomBlack"
        alt="icon-zoom-black"
        title="icon-zoom-black"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAppStore } from "@/stores/app.store"; // Importa el store
import iconZoomWhite from "/images/icon-zoom.svg";
import iconZoomBlack from "/images/icon-zoom-black.svg";

const props = defineProps({
  white: {
    type: [Boolean, String],
    default: true,
  },
});

// Instancia del store
const appStore = useAppStore();

const handleOpenLightbox = () => {
  // Debug: verificar que se está ejecutando
  console.log("SearchIcon clicked, opening lightbox");
  // Llama la acción del store para abrir la lightbox
  appStore.openSearchLightbox();
  console.log("Lightbox state:", appStore.isSearchLightboxActive);
};
</script>
