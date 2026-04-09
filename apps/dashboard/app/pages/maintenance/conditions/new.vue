<template>
  <div>
    <HeroDefault title="Nueva condición" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva condición" :columns="1">
          <FormCondition />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
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
  { label: "Condiciones", to: "/maintenance/conditions" },
  { label: "Nueva" },
];
</script>
