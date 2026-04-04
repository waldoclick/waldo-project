<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/policies/${route.params.id}/edit`"
        >
          Editar Politica
        </NuxtLink>
      </template>
    </HeroDefault>
    <BoxContent>
      <template #content>
        <BoxInformation title="Información" :columns="1">
          <CardInfo v-if="item" title="Título" :description="item.title" />
          <CardInfo v-if="item" title="Contenido" :description="item.text" />
          <CardInfo
            v-if="item"
            title="Orden"
            :description="item.order != null ? String(item.order) : 'Sin orden'"
          />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="item"
            title="Fecha de creación"
            :description="formatDate(item.createdAt)"
          />
          <CardInfo
            v-if="item"
            title="Última modificación"
            :description="formatDate(item.updatedAt)"
          />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<any>(null);
const apiClient = useApiClient();

const title = computed(() => item.value?.title || "Politica");
const breadcrumbs = computed(() => [
  { label: "Politicas", to: "/policies" },
  ...(item.value?.title ? [{ label: item.value.title }] : []),
]);

const { data: policyData } = await useAsyncData(
  `policy-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("policies", {
      method: "GET",
      params: { filters: { id: { $eq: Number(id) } } } as unknown as Record<
        string,
        unknown
      >,
    })) as { data: unknown[] };
    return Array.isArray(response.data) ? response.data[0] : null;
  },
  { default: () => null },
);

item.value = policyData.value ?? null;
</script>
