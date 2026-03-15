import { defineStore } from "pinia";
import { ref } from "vue";
import type { StrapiResponse, StrapiData } from "@nuxtjs/strapi";
import type {
  Indicator,
  ConvertParams,
  ConvertResponse,
} from "@/types/indicator";

export const useIndicatorStore = defineStore(
  "indicator",
  () => {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const indicators = ref<Indicator[]>([]);
    const lastFetchDate = ref<string>("");
    const client = useApiClient();

    async function fetchIndicators() {
      // Obtenemos la fecha actual en formato YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0]!;

      // Si ya tenemos datos y la fecha es la misma que la última consulta
      if (indicators.value.length > 0 && lastFetchDate.value === today) {
        return { data: indicators.value };
      }

      loading.value = true;
      error.value = null;
      try {
        const response = (await client("indicators", {
          method: "GET",
        })) as { data: Indicator[]; meta: { timestamp: string } };

        // Guardar los datos y la fecha
        indicators.value = response.data as unknown as Indicator[];
        lastFetchDate.value = today;

        return response;
      } catch (err) {
        error.value = "Error al obtener los indicadores económicos";
        console.error(err);
        return null;
      } finally {
        loading.value = false;
      }
    }

    async function fetchIndicator(code: string) {
      loading.value = true;
      error.value = null;
      try {
        const response = await client(`indicators/${code}`, {
          method: "GET",
        });
        return response as unknown as StrapiData<Indicator>;
      } catch (err) {
        error.value = "Error al obtener el indicador económico";
        console.error(err);
        return null;
      } finally {
        loading.value = false;
      }
    }

    async function convertCurrency({
      amount,
      from = "CLP",
      to = "USD",
    }: ConvertParams) {
      loading.value = true;
      error.value = null;
      try {
        const response = await client("indicators/convert", {
          method: "GET",
          params: { amount, from, to } as unknown as Record<string, unknown>,
        });
        return response as unknown as StrapiResponse<ConvertResponse>;
      } catch (err) {
        error.value = "Error al convertir la moneda";
        console.error(err);
        return null;
      } finally {
        loading.value = false;
      }
    }

    return {
      loading,
      error,
      indicators,
      lastFetchDate,
      fetchIndicators,
      fetchIndicator,
      convertCurrency,
    };
  },
  {
    // persist: CORRECT — daily economic indicators with date-based cache (lastFetchDate); valid to reuse on same calendar day
    persist: true,
  },
);
