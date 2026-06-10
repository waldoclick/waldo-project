// stores/faqs.store.ts

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { FAQ, FAQResponse } from "@/types/faq";

const PAGE_SIZE = 20;

export const useFaqsStore = defineStore("faqs", () => {
  const faqs = ref<FAQ[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const client = useApiClient();

  const loadFaqs = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await client("faqs", {
        method: "GET",
        params: {
          pagination: { pageSize: PAGE_SIZE, page: 1 },
          populate: "*",
          sort: ["createdAt:asc"],
        } as unknown as Record<string, unknown>,
      });

      const typedResponse = response as unknown as FAQResponse;

      if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
        throw new Error("Formato de datos inválido");
      }

      faqs.value = typedResponse.data.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } catch (err) {
      error.value = "Error al cargar las FAQs";
      console.error("Error loading FAQs:", err);
    } finally {
      loading.value = false;
    }
  };

  const featuredFaqs = computed(() => {
    return faqs.value.filter((faq) => faq.featured === true);
  });

  return {
    faqs,
    featuredFaqs,
    loading,
    error,
    loadFaqs,
  };
});
