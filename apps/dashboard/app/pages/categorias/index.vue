<template>
  <HeroDefault title="Categorías" :breadcrumbs="breadcrumbs">
    <template #actions>
      <NuxtLink class="btn btn--primary" to="/categorias/new">
        Agregar categoría
      </NuxtLink>
    </template>
  </HeroDefault>
  <CategoriesDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import CategoriesDefault from "@/components/CategoriesDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Categorías" }];
</script>
