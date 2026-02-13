<template>
  <HeroDefault title="Nuevo FAQ" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Nuevo FAQ" :columns="1">
        <FormFaq />
      </BoxInformation>
    </template>
  </BoxContent>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormFaq from "@/components/FormFaq.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "FAQs", to: "/faqs" }, { label: "Nuevo" }];
</script>
