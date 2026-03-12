<template>
  <div>
    <HeroDefault title="Artículos" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/articles/new">
          Agregar artículo
        </NuxtLink>
      </template>
    </HeroDefault>
    <ArticlesDefault />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import ArticlesDefault from "@/components/ArticlesDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Artículos" }];
</script>
