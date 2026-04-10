<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar pack" :columns="1">
          <FormPack :pack="pack" @saved="handlePackSaved" />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="pack"
            title="Fecha de creación"
            :description="formatDate(pack.createdAt)"
          />
          <CardInfo
            v-if="pack"
            title="Última modificación"
            :description="formatDate(pack.updatedAt)"
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
import FormPack from "@/components/FormPack.vue";
import type { PackData } from "@/components/FormPack.vue";

interface PackRecord extends PackData {
  createdAt?: string;
  updatedAt?: string;
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const pack = ref<PackRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => pack.value?.name || "Pack");
const breadcrumbs = computed(() => [
  { label: "Packs", to: "/maintenance/packs" },
  ...(pack.value?.name
    ? [{ label: pack.value.name, to: `/maintenance/packs/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const handlePackSaved = (updatedPack: PackData) => {
  if (updatedPack) {
    pack.value = updatedPack;
  }
};

const { data: packData } = await useAsyncData(
  `pack-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("ad-packs", {
      method: "GET",
      params: { filters: { documentId: { $eq: id } } } as unknown as Record<
        string,
        unknown
      >,
    })) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = (await apiClient(`ad-packs/${id}`, { method: "GET" })) as {
      data: unknown;
    };
    return (fallback.data as unknown) || null;
  },
);

pack.value = packData.value ?? null;
</script>
