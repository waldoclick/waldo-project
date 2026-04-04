<template>
  <section class="policies policies--default">
    <div class="policies--default__container">
      <h1 class="policies--default__title title">Políticas de privacidad</h1>
      <div class="policies--default__hero">
        <div class="policies--default__hero__text paragraph">
          <p>
            Servicio en línea el anuncio de Activos Industriales Nuevos y/o
            Usados, sean estos, Equipos, Vehículos industriales, Repuestos,
            Insumos, a través del sitio web Waldo.click® (en adelante "Servicio
            de Marketing en línea"). Para utilizar y registrarse en
            Waldo.click®, le pedimos considere los siguientes puntos:
          </p>
        </div>
      </div>
      <div class="policies--default__faq">
        <AccordionDefault :questions="policies" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Policy } from "@/types/policy";
import AccordionDefault from "@/components/AccordionDefault.vue";

defineProps<{
  policies: Policy[];
}>();
</script>
