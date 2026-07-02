<template>
  <div>
    <HeroHeaderDashboard title="Política de Cookies" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/dashboard/maintenance/cookies/new">
          Agregar Sección
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <CookiePoliciesDashboard />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Política de Cookies" }];
</script>
