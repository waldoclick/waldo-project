<template>
  <div class="summary-default">
    <span class="summary-default__title">{{ title }}</span>
    <span v-if="text" class="summary-default__text">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    text?: string;
  }>(),
  {
    title: "Tipo de publicación",
  },
);
</script>
