<template>
  <div>
    <HeroDefault title="Condiciones" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/maintenance/conditions/new">
          Agregar condición
        </NuxtLink>
      </template>
    </HeroDefault>
    <ConditionsDefault />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import ConditionsDefault from "@/components/ConditionsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Condiciones" }];
</script>
