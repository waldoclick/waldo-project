<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar FAQ" :columns="1">
          <FormFaq :faq="faq" @saved="handleFaqSaved" />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="faq"
            title="Fecha de creación"
            :description="formatDate(faq.createdAt)"
          />
          <CardInfo
            v-if="faq"
            title="Última modificación"
            :description="formatDate(faq.updatedAt)"
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
import FormFaq from "@/components/FormFaq.vue";
import type { FaqData } from "@/components/FormFaq.vue";

interface FaqRecord extends FaqData {
  createdAt?: string;
  updatedAt?: string;
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const faq = ref<FaqRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => faq.value?.title || "FAQ");
const breadcrumbs = computed(() => [
  { label: "FAQs", to: "/maintenance/faqs" },
  ...(faq.value?.title
    ? [{ label: faq.value.title, to: `/maintenance/faqs/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const handleFaqSaved = (updatedFaq: FaqData) => {
  if (updatedFaq) {
    faq.value = updatedFaq;
  }
};

const { data: faqData } = await useAsyncData(
  `faq-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("faqs", {
      method: "GET",
      params: { filters: { documentId: { $eq: id } } } as unknown as Record<
        string,
        unknown
      >,
    })) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = (await apiClient(`faqs/${id}`, { method: "GET" })) as {
      data: unknown;
    };
    return (fallback.data as unknown) || null;
  },
);

faq.value = faqData.value ?? null;
</script>
