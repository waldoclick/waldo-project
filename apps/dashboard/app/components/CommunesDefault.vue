<template>
  <section class="communes communes--default">
    <div class="communes--default__container">
      <div class="communes--default__header">
        <SearchDefault
          :model-value="settingsStore.communes.searchTerm"
          placeholder="Buscar comunas..."
          class="communes--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="communes--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="communes--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="commune in paginatedCommunes" :key="commune.id">
            <TableCell>{{ commune.id }}</TableCell>
            <TableCell>
              <div class="communes--default__name">
                {{ commune.name || "-" }}
              </div>
            </TableCell>
            <TableCell>
              <div class="communes--default__region">
                {{ commune.region?.name || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(commune.updatedAt) }}</TableCell>
            <TableCell align="right">
              <div class="communes--default__actions">
                <button
                  class="communes--default__action"
                  title="Ver comuna"
                  @click="handleViewCommune(commune.id)"
                >
                  <Eye class="communes--default__action__icon" />
                </button>
                <button
                  class="communes--default__action"
                  title="Editar comuna"
                  @click="handleEditCommune(commune.id)"
                >
                  <Pencil class="communes--default__action__icon" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedCommunes.length === 0 && !loading"
          class="communes--default__empty"
        >
          <p>No se encontraron comunas</p>
        </div>

        <div v-if="loading" class="communes--default__loading">
          <p>Cargando comunas...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.communes.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.communes.pageSize"
        class="communes--default__pagination"
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

interface Commune {
  id: number;
  name: string;
  updatedAt: string;
  region?: { name: string };
}

const settingsStore = useSettingsStore();
const section = "communes" as const;

const filters = computed(() => settingsStore.getCommunesFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const allCommunes = ref<Commune[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const fetchCommunes = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();

    const searchParams: any = {
      pagination: {
        page: settingsStore.communes.currentPage,
        pageSize: settingsStore.communes.pageSize,
      },
      sort: settingsStore.communes.sortBy,
      populate: ["region"],
    };

    if (settingsStore.communes.searchTerm) {
      searchParams.filters = {
        $or: [
          { name: { $containsi: settingsStore.communes.searchTerm } },
          { "region.name": { $containsi: settingsStore.communes.searchTerm } },
        ],
      };
    }

    const response = await strapi.find("communes", searchParams);
    allCommunes.value = Array.isArray(response.data) ? response.data : [];
    paginationMeta.value = response.meta?.pagination || null;
  } catch (error) {
    console.error("Error fetching communes:", error);
    allCommunes.value = [];
  } finally {
    loading.value = false;
  }
};

const paginatedCommunes = computed(() => allCommunes.value);

const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

const tableColumns = [
  { label: "ID" },
  { label: "Nombre" },
  { label: "Región" },
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

const handleViewCommune = (communeId: number) => {
  router.push(`/comunas/${communeId}`);
};

const handleEditCommune = (communeId: number) => {
  router.push(`/comunas/${communeId}/editar`);
};

watch(
  [
    () => settingsStore.communes.searchTerm,
    () => settingsStore.communes.sortBy,
    () => settingsStore.communes.pageSize,
    () => settingsStore.communes.currentPage,
  ],
  () => {
    fetchCommunes();
  },
  { immediate: true },
);

onMounted(() => {
  fetchCommunes();
});
</script>
