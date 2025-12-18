<template>
  <div class="emptystate emptystate--default">
    <div class="emptystate--default__image">
      <slot name="image">
        <NuxtImg
          loading="lazy"
          decoding="async"
          :src="emptyImage"
          alt="No hay anuncios disponibles"
          title="No hay anuncios disponibles"
        />
      </slot>
    </div>

    <div class="emptystate--default__text">
      <slot name="message">
        {{ message }}
      </slot>
    </div>

    <div v-if="showCleanFilters" class="emptystate--default__image">
      <nuxt-link
        :to="{ path: '/anuncios', query: { s: '', category: '' } }"
        class="btn btn--secondary btn--block"
        title="[Limpiar filtros]"
      >
        <span>[Limpiar filtros]</span>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import emptyImage from "/images/icon-empty.svg";

defineProps({
  showCleanFilters: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: `No hay anuncios disponibles para tu búsqueda.`,
  },
});
</script>
