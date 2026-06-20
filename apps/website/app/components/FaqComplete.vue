<template>
  <!-- Full FAQ list. NOT a <section> — it renders inside the about layout's
       content section, which already owns the vertical padding. -->
  <div class="faq faq--complete">
    <AccordionDefault :questions="faqs" title-tag="h2" />
  </div>
</template>

<script setup lang="ts">
import type { FAQ } from "@/types/faq";
import AccordionDefault from "@/components/AccordionDefault.vue";

defineProps<{
  faqs: FAQ[];
}>();
</script>
