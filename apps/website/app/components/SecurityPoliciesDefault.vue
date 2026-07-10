<template>
  <section class="security security--default">
    <div class="security--default__container">
      <h1 class="security--default__title title">Política de Seguridad</h1>
      <div class="security--default__hero">
        <div class="security--default__hero__text paragraph">
          <p>
            Así protegemos la información en Waldo.click® y esto es lo que
            hacemos frente a incidentes de seguridad.
          </p>
        </div>
      </div>
      <div class="security--default__faq">
        <AccordionDefault :questions="securityPolicies" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SecurityPolicy } from "@/types/security-policy";
import AccordionDefault from "@/components/AccordionDefault.vue";

defineProps<{
  securityPolicies: SecurityPolicy[];
}>();
</script>
