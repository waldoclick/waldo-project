<template>
  <HeroDefault title="Nueva condición" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Nueva condición" :columns="1">
        <FormCondition />
      </BoxInformation>
    </template>
  </BoxContent>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormCondition from "@/components/FormCondition.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Condiciones", to: "/condiciones" },
  { label: "Nueva" },
];
</script>
