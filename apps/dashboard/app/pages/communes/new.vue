<template>
  <div>
    <HeroDefault title="Nueva comuna" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Nueva comuna" :columns="1">
          <FormCommune />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormCommune from "@/components/FormCommune.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Comunas", to: "/communes" }, { label: "Nueva" }];
</script>
