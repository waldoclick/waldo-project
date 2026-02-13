<template>
  <HeroDefault title="Condiciones" :breadcrumbs="breadcrumbs">
    <template #actions>
      <NuxtLink class="btn btn--primary" to="/condiciones/new">
        Agregar condición
      </NuxtLink>
    </template>
  </HeroDefault>
  <ConditionsDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import ConditionsDefault from "@/components/ConditionsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Condiciones" }];
</script>
