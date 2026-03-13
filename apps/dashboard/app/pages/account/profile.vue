<template>
  <div>
    <HeroDefault title="Mi Perfil" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar perfil" :columns="1">
          <FormEdit />
        </BoxInformation>
        <BoxInformation title="Cambiar contraseña" :columns="1">
          <FormPassword />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import FormEdit from "@/components/FormEdit.vue";
import FormPassword from "@/components/FormPassword.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Mi Perfil" }];
</script>
