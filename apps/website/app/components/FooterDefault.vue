<template>
  <footer class="footer footer--default">
    <!-- indicators row -->
    <div class="footer--default__indicators">
      <div class="footer--default__indicators__container">
        <span
          v-for="indicator in indicators"
          :key="indicator.code"
          class="footer--default__indicators__item"
        >
          {{ getShortName(indicator.code) }}
          <strong class="footer--default__indicators__item__value">
            {{ formatValue(indicator.value, indicator.unit) }}
          </strong>
        </span>
      </div>
    </div>
    <!-- main row -->
    <div class="footer--default__main">
      <div class="footer--default__main__container">
        <NuxtLink to="/" class="footer--default__main__logo">
          <img src="/images/logo-black.svg" alt="Waldo.click" />
        </NuxtLink>
        <nav class="footer--default__main__nav">
          <NuxtLink
            to="/preguntas-frecuentes"
            class="footer--default__main__nav__link"
            >Preguntas Frecuentes</NuxtLink
          >
          <NuxtLink
            to="/politicas-de-privacidad"
            class="footer--default__main__nav__link"
            >Políticas de privacidad</NuxtLink
          >
          <NuxtLink
            to="/condiciones-de-uso"
            class="footer--default__main__nav__link"
            >Condiciones de uso</NuxtLink
          >
        </nav>
        <span class="footer--default__main__copy">{{
          getCopyrightText()
        }}</span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useIndicatorStore } from "@/stores/indicator.store";

const indicatorStore = useIndicatorStore();
const { indicators } = storeToRefs(indicatorStore);

const getShortName = (code: string) => {
  const names: Record<string, string> = {
    uf: "UF",
    dolar: "USD",
    euro: "EUR",
    utm: "UTM",
    ipc: "IPC",
  };
  return names[code] ?? code.toUpperCase();
};

const formatValue = (value: number, unit: string) => {
  if (unit === "Porcentaje") return `${value}%`;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: unit === "Pesos" ? 0 : 2,
  }).format(value);
};

const getCopyrightText = () => {
  const currentYear = new Date().getFullYear();
  return currentYear > 2024
    ? `Waldo.click® 2024–${currentYear} · Todos los derechos reservados`
    : "Waldo.click® 2024 · Todos los derechos reservados";
};

onMounted(async () => {
  await indicatorStore.fetchIndicators();
});
</script>
