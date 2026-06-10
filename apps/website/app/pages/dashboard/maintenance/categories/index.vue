<template>
  <div>
    <HeroHeaderDashboard title="Categorías" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          to="/dashboard/maintenance/categories/new"
        >
          Agregar categoría
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <CategoriesDefault />
  </div>
</template>

<script setup lang="ts">
import CategoriesDefault from "@/components/CategoriesDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Categorías" }];
</script>
