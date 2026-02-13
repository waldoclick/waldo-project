<template>
  <HeroDefault title="Nueva región" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Nueva región" :columns="1">
        <FormRegion />
      </BoxInformation>
    </template>
  </BoxContent>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormRegion from "@/components/FormRegion.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Regiones", to: "/regiones" },
  { label: "Nueva" },
];
</script>
