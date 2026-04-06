<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/communes/${route.params.id}/edit`"
        >
          Editar comuna
        </NuxtLink>
      </template>
    </HeroDefault>
    <BoxContent>
      <template #content>
        <BoxInformation title="Información" :columns="2">
          <CardInfo v-if="commune" title="Nombre" :description="commune.name" />
          <CardInfo
            v-if="commune"
            title="Región"
            :description="commune.region?.name || '--'"
          />
          <CardInfo v-if="commune" title="Slug" :description="commune.slug" />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="commune"
            title="Fecha de creación"
            :description="formatDate(commune.createdAt)"
          />
          <CardInfo
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
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";
import type { CommuneData } from "@/components/FormCommune.vue";

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
  { label: "Comunas", to: "/communes" },
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
