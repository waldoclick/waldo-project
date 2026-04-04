<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar Condicion de Uso" :columns="1">
          <FormTerm :term="term" @saved="handleTermSaved" />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="term"
            title="Fecha de creación"
            :description="formatDate(term.createdAt)"
          />
          <CardInfo
            v-if="term"
            title="Última modificación"
            :description="formatDate(term.updatedAt)"
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
import FormTerm from "@/components/FormTerm.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const term = ref<any>(null);
const apiClient = useApiClient();

const title = computed(() => term.value?.title || "Condicion de Uso");
const breadcrumbs = computed(() => [
  { label: "Condiciones de Uso", to: "/terms" },
  ...(term.value?.title
    ? [{ label: term.value.title, to: `/terms/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const handleTermSaved = (updatedTerm: any) => {
  if (updatedTerm) {
    term.value = updatedTerm;
  }
};

const { data: termData } = await useAsyncData(
  `term-edit-${route.params.id}`,
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

term.value = termData.value ?? null;
</script>
