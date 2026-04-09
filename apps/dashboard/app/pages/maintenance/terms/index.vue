<template>
  <div>
    <HeroDefault title="Condiciones de Uso" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/maintenance/terms/new">
          Agregar Condicion
        </NuxtLink>
      </template>
    </HeroDefault>
    <TermsDefault />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import TermsDefault from "@/components/TermsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Condiciones de Uso" }];
</script>
