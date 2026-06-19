<template>
  <aside class="filter filter--sidebar">
    <div class="filter--sidebar__header">
      <span class="filter--sidebar__header__title">
        <IconFilter :size="17" />
        Filtros
      </span>
      <button
        class="filter--sidebar__header__clear"
        type="button"
        @click="onClear"
      >
        Limpiar
      </button>
    </div>

    <!-- Categoría -->
    <div class="filter--sidebar__section">
      <span class="filter--sidebar__section__label">Categoría</span>
      <template v-if="isClient">
        <label
          v-for="cat in filterStore.filterCategories"
          :key="cat.id"
          class="filter--sidebar__section__row"
        >
          <span class="filter--sidebar__section__row__inner">
            <input
              type="checkbox"
              class="filter--sidebar__section__row__check"
              :checked="activeCategories.includes(cat.slug)"
              @change="onCategory(cat.slug)"
            />
            <span class="filter--sidebar__section__row__name">{{
              cat.name
            }}</span>
          </span>
          <span
            v-if="cat.count != null"
            class="filter--sidebar__section__row__count"
          >
            {{ cat.count }}
          </span>
        </label>
      </template>
    </div>

    <!-- Condición -->
    <div class="filter--sidebar__section">
      <span class="filter--sidebar__section__label">Condición</span>
      <label
        v-for="opt in conditionOptions"
        :key="opt.value"
        class="filter--sidebar__section__row"
      >
        <span class="filter--sidebar__section__row__inner">
          <input
            type="radio"
            name="condition"
            class="filter--sidebar__section__row__check"
            :value="opt.value"
            :checked="(route.query.condition || '') === opt.value"
            @change="onCondition(opt.value)"
          />
          <span class="filter--sidebar__section__row__name">{{
            opt.label
          }}</span>
        </span>
      </label>
    </div>

    <!-- Precio -->
    <div class="filter--sidebar__section">
      <span class="filter--sidebar__section__label">Precio</span>
      <label
        v-for="opt in priceOptions"
        :key="opt.value"
        class="filter--sidebar__section__row"
      >
        <span class="filter--sidebar__section__row__inner">
          <input
            type="radio"
            name="price"
            class="filter--sidebar__section__row__check"
            :value="opt.value"
            :checked="(route.query.price || '') === opt.value"
            @change="onPrice(opt.value)"
          />
          <span class="filter--sidebar__section__row__name">{{
            opt.label
          }}</span>
        </span>
      </label>
    </div>

    <!-- Año -->
    <div class="filter--sidebar__section">
      <span class="filter--sidebar__section__label">Año</span>
      <label
        v-for="opt in yearOptions"
        :key="opt.value"
        class="filter--sidebar__section__row"
      >
        <span class="filter--sidebar__section__row__inner">
          <input
            type="radio"
            name="year"
            class="filter--sidebar__section__row__check"
            :value="opt.value"
            :checked="(route.query.year || '') === opt.value"
            @change="onYear(opt.value)"
          />
          <span class="filter--sidebar__section__row__name">{{
            opt.label
          }}</span>
        </span>
      </label>
    </div>

    <!-- Ubicación -->
    <div class="filter--sidebar__section">
      <span class="filter--sidebar__section__label">Ubicación</span>
      <div class="filter--sidebar__location">
        <select
          v-if="isClient"
          :value="route.query.commune || ''"
          @change="onCommune(($event.target as HTMLSelectElement).value)"
        >
          <option value="">Todas las ubicaciones</option>
          <option
            v-for="commune in filterStore.filterCommunes"
            :key="commune.id"
            :value="commune.id"
          >
            {{ commune.name }}
          </option>
        </select>
        <svg
          class="filter--sidebar__location__chevron"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFilterStore } from "@/stores/filter.store";
import { Filter as IconFilter } from "lucide-vue-next";

const filterStore = import.meta.client
  ? useFilterStore()
  : ({} as ReturnType<typeof useFilterStore>);

const route = useRoute();
const router = useRouter();
const isClient = ref(false);

const activeCategories = computed(() => {
  const raw = route.query.category?.toString() || "";
  return raw ? raw.split(",").filter(Boolean) : [];
});

onMounted(() => {
  isClient.value = true;
});

const conditionOptions = [
  { value: "", label: "Todos" },
  { value: "nuevo", label: "Nuevo" },
  { value: "usado", label: "Usado" },
];

const priceOptions = [
  { value: "", label: "Cualquier precio" },
  { value: "lt5", label: "Menos de $5M" },
  { value: "5to20", label: "$5M - $20M" },
  { value: "20to50", label: "$20M - $50M" },
  { value: "gt50", label: "Más de $50M" },
];

const yearOptions = [
  { value: "", label: "Cualquier año" },
  { value: "lt2010", label: "Antes de 2010" },
  { value: "2010to2019", label: "2010 - 2019" },
  { value: "2020to2024", label: "2020 - 2024" },
  { value: "gte2025", label: "2025 en adelante" },
];

function onCategory(slug: string) {
  const current = activeCategories.value;
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  router.push({
    query: {
      ...route.query,
      category: next.length > 0 ? next.join(",") : undefined,
      page: 1,
    },
  });
}

function onCondition(value: string) {
  router.push({
    query: {
      ...route.query,
      condition: value || undefined,
      page: 1,
    },
  });
}

function onPrice(value: string) {
  router.push({
    query: {
      ...route.query,
      price: value || undefined,
      page: 1,
    },
  });
}

function onYear(value: string) {
  router.push({
    query: {
      ...route.query,
      year: value || undefined,
      page: 1,
    },
  });
}

function onCommune(value: string) {
  router.push({
    query: {
      ...route.query,
      commune: value || undefined,
      page: 1,
    },
  });
}

function onClear() {
  router.push({
    path: "/anuncios",
    query: route.query.s ? { s: route.query.s } : {},
  });
}
</script>
