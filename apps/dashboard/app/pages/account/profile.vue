<template>
  <div>
    <HeroDefault title="Mi Perfil" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar perfil" :columns="1">
          <FormProfileEdit />
        </BoxInformation>
        <BoxInformation title="Cambiar contraseña" :columns="1">
          <FormProfilePassword />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormProfileEdit from "@/components/FormProfileEdit.vue";
import FormProfilePassword from "@/components/FormProfilePassword.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Mi Perfil" }];
</script>
