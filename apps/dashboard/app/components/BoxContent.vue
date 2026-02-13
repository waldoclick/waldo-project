<template>
  <section class="box box--content">
    <div class="box--content__container">
      <div class="box--content__content">
        <slot name="content" />
      </div>
      <aside class="box--content__sidebar">
        <slot name="sidebar" />
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
// Mini layout component providing content and sidebar slots.
</script>
