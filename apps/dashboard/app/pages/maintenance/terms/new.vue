<template>
  <div>
    <HeroDefault title="Nueva Condicion de Uso" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva Condicion de Uso" :columns="1">
          <FormTerm />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormTerm from "@/components/FormTerm.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Condiciones de Uso", to: "/maintenance/terms" },
  { label: "Nueva" },
];
</script>
