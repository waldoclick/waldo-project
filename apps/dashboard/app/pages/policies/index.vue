<template>
  <div>
    <HeroDefault title="Politicas de Privacidad" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink class="btn btn--primary" to="/policies/new">
          Agregar Politica
        </NuxtLink>
      </template>
    </HeroDefault>
    <PoliciesDefault />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import PoliciesDefault from "@/components/PoliciesDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Politicas" }];
</script>
