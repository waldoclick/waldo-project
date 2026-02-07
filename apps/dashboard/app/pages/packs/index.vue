<template>
  <HeroDefault title="Packs" :breadcrumbs="breadcrumbs">
    <template #actions>
      <NuxtLink class="btn btn--primary" to="/packs/new">
        Agregar pack
      </NuxtLink>
    </template>
  </HeroDefault>
  <PacksDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import PacksDefault from "@/components/PacksDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Packs" }];
</script>
