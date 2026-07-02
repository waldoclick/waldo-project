<template>
  <section class="cookies cookies--default">
    <div class="cookies--default__container">
      <h1 class="cookies--default__title title">Política de Cookies</h1>
      <div class="cookies--default__hero">
        <div class="cookies--default__hero__text paragraph">
          <p>
            Aquí te explicamos qué cookies usamos en Waldo.click®, para qué
            sirven y qué control tienes sobre ellas.
          </p>
        </div>
      </div>
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
