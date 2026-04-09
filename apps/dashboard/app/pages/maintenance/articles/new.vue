<template>
  <div>
    <HeroDefault title="Nuevo artículo" :breadcrumbs="breadcrumbs" />
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
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormArticle from "@/components/FormArticle.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Artículos", to: "/maintenance/articles" },
  { label: "Nuevo" },
];
</script>
