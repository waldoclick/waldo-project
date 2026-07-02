<template>
  <div>
    <HeroHeaderDashboard title="Política de Seguridad" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/dashboard/maintenance/security/new">
          Agregar Sección
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <SecurityPoliciesDashboard />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Política de Seguridad" }];
</script>
