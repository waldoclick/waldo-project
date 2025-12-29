<template>
  <section class="box box--information">
    <header class="box--information__title">
      <h3>{{ title }}</h3>
    </header>
    <div
      class="box--information__description"
      :class="`box--information__description--cols-${columns}`"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  columns: {
    type: Number as () => 1 | 2 | 3,
    default: 1,
  },
});
</script>
