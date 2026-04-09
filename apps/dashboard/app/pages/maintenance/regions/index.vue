<template>
  <div>
    <HeroDefault title="Regiones" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/maintenance/regions/new">
          Agregar región
        </NuxtLink>
      </template>
    </HeroDefault>
    <RegionsDefault />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import RegionsDefault from "@/components/RegionsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Regiones" }];
</script>
