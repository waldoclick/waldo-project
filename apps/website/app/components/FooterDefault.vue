<template>
  <footer class="footer footer--default">
    <div class="footer--default__top">
      <div class="footer--default__top__container">
        <div class="footer--default__top__indicators">
          <div
            v-for="indicator in indicators"
            :key="indicator.code"
            class="footer--default__top__indicators__item"
          >
            <component
              :is="getIndicatorIcon(indicator.code)"
              class="icon"
              :size="16"
            />
            <span class="footer--default__top__indicators__item__name">
              {{ getShortName(indicator.code) }}
            </span>
            <span class="footer--default__top__indicators__item__value">
              {{ formatValue(indicator.value, indicator.unit) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="footer--default__middle">
      <div class="footer--default__middle__container">
        <div class="footer--default__middle__logo">
          <LogoWhite />
        </div>
        <div class="footer--default__middle__menu">
          <MenuFooter />
        </div>
        <div class="footer--default__middle__trademark">
          <p>{{ getCopyrightText() }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import LogoWhite from "@/components/LogoWhite.vue";
import MenuFooter from "@/components/MenuFooter.vue";
import { useIndicatorStore } from "@/stores/indicator.store";
import type { Indicator } from "@/types/indicator";
import { ref, onMounted } from "vue";
import {
  DollarSign,
  Euro,
  Building2,
  Calculator,
  TrendingUp,
} from "lucide-vue-next";
import { storeToRefs } from "pinia";

const indicatorStore = useIndicatorStore();
const { indicators } = storeToRefs(indicatorStore);

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

// Function to generate the copyright text
const getCopyrightText = () => {
  const currentYear = new Date().getFullYear();
  const baseYear = 2024;
  return currentYear > baseYear
    ? `Waldo.click® ${baseYear} - ${currentYear}, Todos los derechos reservados`
    : `Waldo.click® ${baseYear}, Todos los derechos reservados`;
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
  await indicatorStore.fetchIndicators();
});
</script>
