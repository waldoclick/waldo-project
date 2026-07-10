<template>
  <section class="security security--default">
    <div class="security--default__container">
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
