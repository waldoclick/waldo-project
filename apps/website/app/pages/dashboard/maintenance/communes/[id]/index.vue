<template>
  <div>
    <HeroHeaderDashboard :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/dashboard/maintenance/communes/${route.params.id}/edit`"
        >
          Editar comuna
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <BoxContent>
      <template #content>
        <BoxInformation title="Información" :columns="2">
          <CardInfoDashboard
            v-if="commune"
            title="Nombre"
            :description="commune.name"
          />
          <CardInfoDashboard
            v-if="commune"
            title="Región"
            :description="commune.region?.name || '--'"
          />
          <CardInfoDashboard
            v-if="commune"
            title="Slug"
            :description="commune.slug"
          />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfoDashboard
            v-if="commune"
            title="Fecha de creación"
            :description="formatDate(commune.createdAt)"
          />
          <CardInfoDashboard
            v-if="commune"
            title="Última modificación"
            :description="formatDate(commune.updatedAt)"
          />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import type { CommuneData } from "@/components/FormCommune.vue";
import { formatDate } from "@/utils/date";

interface CommuneRecord extends Omit<CommuneData, "region"> {
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  region?: { id?: number; name?: string };
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const commune = ref<CommuneRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => commune.value?.name || "Comuna");
const breadcrumbs = computed(() => [
  { label: "Comunas", to: "/dashboard/maintenance/communes" },
  ...(commune.value?.name ? [{ label: commune.value.name }] : []),
]);

const { data: communeData } = await useAsyncData(
  `commune-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("communes", {
      method: "GET",
      params: {
        filters: { documentId: { $eq: id } },
        populate: "region",
      } as unknown as Record<string, unknown>,
    })) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = (await apiClient(`communes/${id}`, {
      method: "GET",
      params: { populate: "region" } as unknown as Record<string, unknown>,
    })) as { data: unknown };
    return (fallback.data as unknown) || null;
  },
);

commune.value = communeData.value ?? null;
</script>
