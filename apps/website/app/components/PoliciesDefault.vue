<template>
  <div class="policies policies--default">
    <div class="policies--default__container">
      <div class="policies--default__accordion">
        <AccordionDefault :questions="policies" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Policy } from "@/types/policy";
import AccordionDefault from "@/components/AccordionDefault.vue";

defineProps<{
  policies: Policy[];
}>();
</script>
