<template>
  <div class="stats stats--default">
    <div
      v-for="indicator in indicators"
      :key="indicator.code"
      class="stats--default__item"
    >
      <component
        :is="getIndicatorIcon(indicator.code)"
        class="stats--default__item__icon"
        :size="16"
      />
      <span class="stats--default__item__name">
        {{ getShortName(indicator.code) }}
      </span>
      <span class="stats--default__item__value">
        {{ formatValue(indicator.value, indicator.unit) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import {
  DollarSign,
  Euro,
  Building2,
  Calculator,
  TrendingUp,
} from "lucide-vue-next";

interface Indicator {
  code: string;
  value: number;
  unit: string;
}

const indicators = ref<Indicator[]>([]);

// Función para obtener el icono correspondiente según el código del indicador
const getIndicatorIcon = (code: string) => {
  const icons = {
    dolar: DollarSign,
    euro: Euro,
    uf: Building2,
    utm: Calculator,
    ipc: TrendingUp,
  };
  return icons[code as keyof typeof icons] || DollarSign;
};

// Función para formatear el valor según la unidad
const formatValue = (value: number, unit: string) => {
  if (unit === "Porcentaje") {
    return `${value}%`;
  }
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: unit === "Pesos" ? 0 : 2,
  }).format(value);
};

// Función para obtener el nombre corto del indicador
const getShortName = (code: string) => {
  const names = {
    uf: "UF",
    dolar: "USD",
    euro: "EUR",
    utm: "UTM",
    ipc: "IPC",
  };
  return names[code as keyof typeof names] || code.toUpperCase();
};

// Cargar los indicadores al montar el componente
onMounted(async () => {
  try {
    const strapi = useStrapi();
    const response = await strapi.find<{
      data: Indicator[];
      meta: { timestamp: string };
    }>("indicators");

    indicators.value = (response.data as unknown as Indicator[]) || [];
  } catch (error) {
    console.error("Error fetching indicators:", error);
  }
});
</script>
