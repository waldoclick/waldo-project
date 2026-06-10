<template>
  <div>
    <HeroDefaultDashboard title="Categorías" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/maintenance/categories/new">
          Agregar categoría
        </NuxtLink>
      </template>
    </HeroDefaultDashboard>
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
