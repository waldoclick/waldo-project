<template>
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
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";
import FormFaq from "@/components/FormFaq.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const faq = ref<any>(null);

const title = computed(() => faq.value?.title || "FAQ");
const breadcrumbs = computed(() => [
  { label: "FAQs", to: "/faqs" },
  ...(faq.value?.title
    ? [{ label: faq.value.title, to: `/faqs/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleFaqSaved = (updatedFaq: any) => {
  if (updatedFaq) {
    faq.value = updatedFaq;
  }
};

const { data: faqData } = await useAsyncData(
  `faq-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const strapi = useStrapi();
    const response = await strapi.find("faqs", {
      filters: { documentId: { $eq: id } },
    });
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallbackResponse = await strapi.findOne("faqs", id as string);
    return fallbackResponse.data || null;
  },
);

faq.value = faqData.value;
</script>
