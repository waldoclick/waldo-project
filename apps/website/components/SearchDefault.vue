<template>
  <form :class="`search ${getTypeClass}`" @submit.prevent="handleSubmit">
    <!-- <client-only> -->
    <div :class="`${getTypeClass}__field`">
      <div :class="`${getTypeClass}__field__icon`">
        <IconSearch :size="24" class="icon-search" />
      </div>

      <div :class="`${getTypeClass}__field__query`">
        <label for="query">Buscar equipo por nombre</label>
        <input
          v-model="form.query"
          name="query"
          type="text"
          placeholder="Escribe…"
        />
      </div>
    </div>
    <div :class="`${getTypeClass}__field ${getTypeClass}__field--category`">
      <div :class="`${getTypeClass}__field__icon`">
        <IconFilter :size="24" class="icon-filter" />
      </div>
      <div :class="`${getTypeClass}__field__category`">
        <label for="category">Elegir una categoría</label>
        <select v-model="form.category" name="category">
          <option value="">Todas</option>
          <option
            v-for="item in categories ?? []"
            v-show="(categories ?? []).length > 0"
            :key="item.slug"
            :value="item.slug"
            :style="null"
          >
            {{ item.name }} ({{ item.count || 0 }})
          </option>
        </select>
      </div>
    </div>
    <div :class="`${getTypeClass}__field ${getTypeClass}__field--button`">
      <button title="Buscar" :class="`${getTypeClass}__field__button`">
        <span>Buscar</span>
      </button>
    </div>
    <!-- </client-only> -->
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useFilterStore } from "@/stores/filter.store";
import { useAppStore } from "@/stores/app.store";
import { Search as IconSearch, Filter as IconFilter } from "lucide-vue-next";
import type { LocationQueryValue } from "vue-router";
import type { FilterCategory } from "@/types/filter";

const props = defineProps<{
  type?: string;
  small?: boolean;
}>();

const route = useRoute();
const router = useRouter();

const form = ref({
  query: String(route.query.s || ""),
  category: String(route.query.category || ""),
});

const filterStore = useFilterStore();
const appStore = useAppStore();

// Cargar y ordenar categorías antes del renderizado
const { data: categories } = await useAsyncData(
  "search-categories",
  async () => {
    const cats = await filterStore.loadFilterCategories();
    return (cats as (FilterCategory & { count?: number })[]).sort(
      (a, b) => (b.count || 0) - (a.count || 0)
    );
  }
);

const getTypeClass = computed(() => `search--${props.type || "default"}`);

watch(
  () => route.query.category,
  (newCategory: LocationQueryValue | LocationQueryValue[]) => {
    form.value.category = String(newCategory || "");
  }
);

// Limpiar query si no está presente en la URL
watch(
  () => route.query.s,
  (newQuery) => {
    if (!newQuery) {
      form.value.query = "";
    }
  }
);

const handleSubmit = () => {
  const queries = {
    s: form.value.query.toLowerCase() || null,
    category: form.value.category || null,
    page: 1,
  };

  router.push({
    path: "/anuncios",
    query: {
      ...Object.fromEntries(
        Object.entries(queries).filter(([_, v]) => v != null)
      ),
    },
  });

  // Cerrar el lightbox después de la búsqueda
  appStore.closeSearchLightbox();
};
</script>
