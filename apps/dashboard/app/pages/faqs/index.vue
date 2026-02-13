<template>
  <HeroDefault title="FAQs" :breadcrumbs="breadcrumbs">
    <template #actions>
      <NuxtLink class="btn btn--primary" to="/faqs/new"> Agregar FAQ </NuxtLink>
    </template>
  </HeroDefault>
  <FaqsDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import FaqsDefault from "@/components/FaqsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "FAQs" }];
</script>
