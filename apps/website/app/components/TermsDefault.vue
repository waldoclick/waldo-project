<template>
  <div class="terms terms--default">
    <div class="terms--default__container">
      <div class="terms--default__accordion">
        <AccordionDefault :questions="terms" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Term } from "@/types/term";
import AccordionDefault from "@/components/AccordionDefault.vue";

defineProps<{
  terms: Term[];
}>();
</script>
