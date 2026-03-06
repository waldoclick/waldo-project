<template>
  <section class="packs packs--default">
    <div class="packs--default__container">
      <div class="packs--default__header">
        <SearchDefault
          :model-value="settingsStore.packs.searchTerm"
          placeholder="Buscar packs..."
          class="packs--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="packs--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="packs--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="pack in paginatedPacks" :key="pack.id">
            <TableCell>
              <div class="packs--default__name">
                {{ pack.name || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatCurrency(pack.price) }}</TableCell>
            <TableCell>{{ pack.total_days || "-" }} días</TableCell>
            <TableCell>
              <BadgeDefault variant="outline">
                {{ pack.total_ads || 0 }} anuncios
              </BadgeDefault>
            </TableCell>
            <TableCell>{{ pack.total_features || 0 }} destacados</TableCell>
            <TableCell>{{ formatDate(pack.createdAt) }}</TableCell>
            <TableCell align="right">
              <div class="packs--default__actions">
                <button
                  class="packs--default__action"
                  title="Ver pack"
                  @click="handleViewPack(pack.id)"
                >
                  <Eye class="packs--default__action__icon" />
                </button>
                <button
                  class="packs--default__action"
                  title="Editar pack"
                  @click="handleEditPack(pack.id)"
                >
                  <Pencil class="packs--default__action__icon" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedPacks.length === 0 && !loading"
          class="packs--default__empty"
        >
          <p>No se encontraron packs</p>
        </div>

        <div v-if="loading" class="packs--default__loading">
          <p>Cargando packs...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.packs.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.packs.pageSize"
        class="packs--default__pagination"
        @page-change="
          (page: number) => settingsStore.setCurrentPage(section, page)
        "
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye, Pencil } from "lucide-vue-next";
import { formatCurrency } from "@/utils/price";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";
import type { Pack } from "@/types/pack";

const settingsStore = useSettingsStore();
const section = "packs" as const;

const filters = computed(() => settingsStore.getPacksFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const allPacks = ref<Pack[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const fetchPacks = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();

    const searchParams: Record<string, unknown> = {
      pagination: {
        page: settingsStore.packs.currentPage,
        pageSize: settingsStore.packs.pageSize,
      },
      sort: settingsStore.packs.sortBy,
    };

    if (settingsStore.packs.searchTerm) {
      searchParams.filters = {
        $or: [
          { name: { $containsi: settingsStore.packs.searchTerm } },
          { text: { $containsi: settingsStore.packs.searchTerm } },
        ],
      };
    }

    const response = await strapi.find("ad-packs", searchParams);
    allPacks.value = Array.isArray(response.data)
      ? (response.data as Pack[])
      : [];
    paginationMeta.value = (response.meta?.pagination ||
      null) as typeof paginationMeta.value;
  } catch (error) {
    console.error("Error fetching packs:", error);
    allPacks.value = [];
  } finally {
    loading.value = false;
  }
};

const paginatedPacks = computed(() => allPacks.value);

const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

const tableColumns = [
  { label: "Pack" },
  { label: "Precio" },
  { label: "Duración" },
  { label: "Anuncios" },
  { label: "Destacados" },
  { label: "Fecha de Creación" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "name:asc", label: "Nombre A-Z" },
  { value: "name:desc", label: "Nombre Z-A" },
  { value: "price:asc", label: "Precio menor a mayor" },
  { value: "price:desc", label: "Precio mayor a menor" },
];

const router = useRouter();

const handleViewPack = (packId: number) => {
  router.push(`/packs/${packId}`);
};

const handleEditPack = (packId: number) => {
  router.push(`/packs/${packId}/editar`);
};

watch(
  [
    () => settingsStore.packs.searchTerm,
    () => settingsStore.packs.sortBy,
    () => settingsStore.packs.pageSize,
    () => settingsStore.packs.currentPage,
  ],
  () => {
    fetchPacks();
  },
  { immediate: true },
);
</script>
