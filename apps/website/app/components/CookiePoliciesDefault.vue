<template>
  <section class="cookies cookies--default">
    <div class="cookies--default__container">
      <div class="cookies--default__faq">
        <AccordionDefault :questions="cookiePolicies" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CookiePolicy } from "@/types/cookie-policy";
import AccordionDefault from "@/components/AccordionDefault.vue";

defineProps<{
  cookiePolicies: CookiePolicy[];
}>();
</script>
