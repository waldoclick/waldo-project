<template>
  <section class="hero hero--default">
    <div class="hero--default__container">
      <h1 class="hero--default__title title title--big">
        {{ title }}
      </h1>
      <p v-if="description" class="hero--default__text">
        {{ description }}
      </p>
    </div>
    <div class="hero--default__bg">
      <PictureDefault />
    </div>
  </section>
</template>

<script setup lang="ts">
import PictureDefault from "@/components/PictureDefault.vue";

const props = defineProps<{
  title?: string;
  description?: string;
}>();
</script>
