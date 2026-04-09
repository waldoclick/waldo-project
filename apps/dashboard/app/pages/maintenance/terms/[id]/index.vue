<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/maintenance/terms/${route.params.id}/edit`"
        >
          Editar Condicion
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
import type { TermData } from "@/components/FormTerm.vue";

interface TermRecord extends TermData {
  createdAt?: string;
  updatedAt?: string;
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<TermRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => item.value?.title || "Condicion de Uso");
const breadcrumbs = computed(() => [
  { label: "Condiciones de Uso", to: "/maintenance/terms" },
  ...(item.value?.title ? [{ label: item.value.title }] : []),
]);

const { data: termData } = await useAsyncData(
  `term-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("terms", {
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

item.value = termData.value ?? null;
</script>
