<template>
  <div>
    <HeroDefault title="Nueva Politica" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva Politica" :columns="1">
          <FormPolicy />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormPolicy from "@/components/FormPolicy.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Politicas", to: "/maintenance/policies" },
  { label: "Nueva" },
];
</script>
