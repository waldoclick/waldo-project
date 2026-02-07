<template>
  <HeroDefault title="Nuevo pack" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Nuevo pack" :columns="1">
        <FormPack />
      </BoxInformation>
    </template>
  </BoxContent>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormPack from "@/components/FormPack.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Packs", to: "/packs" }, { label: "Nuevo" }];
</script>
