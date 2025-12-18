<template>
  <div
    class="lightbox lightbox--search"
    :class="{ 'is-open': isSearchLightboxActive }"
  >
    <div class="lightbox--search__backdrop" @click="handleCloseLightbox" />
    <div class="lightbox--search__box">
      <button
        title="Cerrar búsqueda"
        type="button"
        class="lightbox__button"
        @click="handleCloseLightbox"
      >
        <IconX :size="24" class="icon-close" />
      </button>
      <div class="lightbox--search__box__form">
        <SearchDefault type="mobile" />
      </div>
      <div class="lightbox--search__box__content">
        <NuxtImg
          loading="lazy"
          class="lightbox--search__box__content__image"
          :src="searchImage"
          alt="Buscar en Waldo.click®"
          title="Buscar en Waldo.click®"
        />
        <div class="lightbox--search__box__content__paragraph">
          <div class="lightbox--search__box__content__paragraph__title">
            Buscar en
            <strong>Waldo.click®</strong>
          </div>
          <div class="lightbox--search__box__content__paragraph__text">
            Encuentra cientos de vendores con ese equipo que necesitas
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import SearchDefault from "@/components/SearchDefault.vue";
import { useAppStore } from "@/stores/app.store";
import { X as IconX } from "lucide-vue-next";

// Importación de la imagen de búsqueda
import searchImage from "/images/search-image.svg";

// Instancia del store
const appStore = useAppStore();

// Computed para obtener el valor reactivo del store
const isSearchLightboxActive = computed(() => {
  // console.log(
  //   "LightboxSearch computed - isSearchLightboxActive:",
  //   appStore.isSearchLightboxActive,
  // );
  return appStore.isSearchLightboxActive;
});

const handleCloseLightbox = () => {
  // Cierra el lightbox utilizando el store
  appStore.closeSearchLightbox();
};

// Función para manejar la tecla ESC
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isSearchLightboxActive.value) {
    handleCloseLightbox();
  }
};

// Agregar y remover el event listener para la tecla ESC
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
