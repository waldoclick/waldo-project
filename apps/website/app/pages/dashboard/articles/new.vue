<template>
  <div>
    <HeroDefaultDashboard title="Nuevo artículo" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nuevo artículo" :columns="1">
          <FormArticle />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import FormArticle from "@/components/FormArticle.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Artículos", to: "/dashboard/articles" },
  { label: "Nuevo" },
];
</script>
