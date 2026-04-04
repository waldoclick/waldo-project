<template>
  <section class="terms terms--default">
    <div class="terms--default__container">
      <h1 class="terms--default__title title">Condiciones de uso</h1>
      <div class="terms--default__hero">
        <div class="terms--default__hero__text paragraph">
          <p>
            Al utilizar la plataforma Waldo.click® para la publicación y compra
            de anuncios de activos industriales, usted acepta las siguientes
            condiciones de uso:
          </p>
        </div>
      </div>
      <div class="terms--default__faq">
        <AccordionDefault :questions="terms" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Term } from "@/types/term";
import AccordionDefault from "@/components/AccordionDefault.vue";

defineProps<{
  terms: Term[];
}>();
</script>
