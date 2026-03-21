<template>
  <HeroDefault title="Comunas" :breadcrumbs="breadcrumbs">
    <template #actions>
      <NuxtLink class="btn btn--primary" to="/comunas/new">
        Agregar comuna
      </NuxtLink>
    </template>
  </HeroDefault>
  <CommunesDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import CommunesDefault from "@/components/CommunesDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Comunas" }];
</script>
