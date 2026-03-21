<template>
  <HeroDefault title="Nueva categoría" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Nueva categoría" :columns="1">
        <FormCategory />
      </BoxInformation>
    </template>
  </BoxContent>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormCategory from "@/components/FormCategory.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Categorías", to: "/categorias" },
  { label: "Nueva" },
];
</script>
