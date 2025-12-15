// stores/faqs.store.ts

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { FAQ, FAQResponse } from "@/types/faq";

const CACHE_DURATION = 3600000; // 1 hora en milisegundos
const PAGE_SIZE = 20;

export const useFaqsStore = defineStore(
  "faqs",
  () => {
    const faqs = ref<FAQ[]>([]);
    const lastFetchTimestamp = ref<number | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const strapi = useStrapi();

    const loadFaqs = async () => {
      const now = Date.now();

      // Verificar si los datos han expirado
      if (
        !lastFetchTimestamp.value ||
        now - lastFetchTimestamp.value > CACHE_DURATION
      ) {
        try {
          loading.value = true;
          error.value = null;

          const response = await strapi.find("faqs", {
            pagination: { pageSize: PAGE_SIZE, page: 1 },
            populate: "*",
            sort: ["createdAt:asc"], // Ordenar de más antigua a más nueva
          });

          const typedResponse = response as unknown as FAQResponse;

          if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
            throw new Error("Formato de datos inválido");
          }

          // Ordenar por fecha de creación (más antigua primero)
          faqs.value = typedResponse.data.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          lastFetchTimestamp.value = now;
        } catch (err) {
          error.value = "Error al cargar las FAQs";
          console.error("Error loading FAQs:", err);
        } finally {
          loading.value = false;
        }
      }
    };

    // Getter para FAQs destacadas
    const featuredFaqs = computed(() => {
      return faqs.value.filter((faq) => faq.featured === true);
    });

    return {
      faqs,
      featuredFaqs,
      lastFetchTimestamp,
      loading,
      error,
      loadFaqs,
    };
  },
  {
    persist: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
    },
  }
);
