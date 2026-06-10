<template>
  <div>
    <HeroDefaultDashboard title="Comunas" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/maintenance/communes/new">
          Agregar comuna
        </NuxtLink>
      </template>
    </HeroDefaultDashboard>
    <CommunesDefault />
  </div>
</template>

<script setup lang="ts">
import CommunesDefault from "@/components/CommunesDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Comunas" }];
</script>
