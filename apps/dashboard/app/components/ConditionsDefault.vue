<template>
  <section class="conditions conditions--default">
    <div class="conditions--default__container">
      <div class="conditions--default__header">
        <SearchDefault
          :model-value="settingsStore.conditions.searchTerm"
          placeholder="Buscar condiciones..."
          class="conditions--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="conditions--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="conditions--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow
            v-for="condition in paginatedConditions"
            :key="condition.id"
          >
            <TableCell>{{ condition.id }}</TableCell>
            <TableCell>
              <div class="conditions--default__name">
                {{ condition.name || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(condition.updatedAt) }}</TableCell>
            <TableCell align="right">
              <div class="conditions--default__actions">
                <button
                  class="conditions--default__action"
                  title="Ver condición"
                  @click="handleViewCondition(condition.id)"
                >
                  <Eye class="conditions--default__action__icon" />
                </button>
                <button
                  class="conditions--default__action"
                  title="Editar condición"
                  @click="handleEditCondition(condition.id)"
                >
                  <Pencil class="conditions--default__action__icon" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedConditions.length === 0 && !loading"
          class="conditions--default__empty"
        >
          <p>No se encontraron condiciones</p>
        </div>

        <div v-if="loading" class="conditions--default__loading">
          <p>Cargando condiciones...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.conditions.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.conditions.pageSize"
        class="conditions--default__pagination"
        @page-change="
          (page: number) => settingsStore.setCurrentPage(section, page)
        "
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye, Pencil } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

interface Condition {
  id: number;
  name: string;
  updatedAt: string;
}

const settingsStore = useSettingsStore();
const section = "conditions" as const;

const filters = computed(() => settingsStore.getConditionsFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const allConditions = ref<Condition[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const fetchConditions = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();

    const searchParams: any = {
      pagination: {
        page: settingsStore.conditions.currentPage,
        pageSize: settingsStore.conditions.pageSize,
      },
      sort: settingsStore.conditions.sortBy,
    };

    if (settingsStore.conditions.searchTerm) {
      searchParams.filters = {
        name: {
          $containsi: settingsStore.conditions.searchTerm,
        },
      };
    }

    const response = await strapi.find("conditions", searchParams);
    allConditions.value = Array.isArray(response.data) ? response.data : [];
    paginationMeta.value = response.meta?.pagination || null;
  } catch (error) {
    console.error("Error fetching conditions:", error);
    allConditions.value = [];
  } finally {
    loading.value = false;
  }
};

const paginatedConditions = computed(() => allConditions.value);

const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

const tableColumns = [
  { label: "ID" },
  { label: "Nombre" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "name:asc", label: "Nombre A-Z" },
  { value: "name:desc", label: "Nombre Z-A" },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const router = useRouter();

const handleViewCondition = (conditionId: number) => {
  router.push(`/condiciones/${conditionId}`);
};

const handleEditCondition = (conditionId: number) => {
  router.push(`/condiciones/${conditionId}/editar`);
};

watch(
  [
    () => settingsStore.conditions.searchTerm,
    () => settingsStore.conditions.sortBy,
    () => settingsStore.conditions.pageSize,
    () => settingsStore.conditions.currentPage,
  ],
  () => {
    fetchConditions();
  },
  { immediate: true },
);

onMounted(() => {
  fetchConditions();
});
</script>
