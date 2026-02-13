<template>
  <div class="alert alert--default">
    <div class="alert--default__title">
      {{ title }}
    </div>
    <div class="alert--default__text">
      {{ text }}
    </div>
    <div v-if="button && to" class="alert--default__button">
      <nuxt-link :to="to" :title="button" class="btn btn--buy">
        <span>{{ button }}</span>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: `Todavía no has subido ningún anuncio, ¡hazlo ahora!`,
  },
  text: {
    type: String,
    default: `Tienes 3 anuncios gratuitos para usar`,
  },
  button: {
    type: String,
    default: ``,
  },
  to: {
    type: String,
    default: ``,
  },
});
</script>

<style lang="scss" scoped></style>
