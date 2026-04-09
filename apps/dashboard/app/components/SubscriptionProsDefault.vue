<template>
  <section class="subscription-pros subscription-pros--default">
    <div class="subscription-pros--default__container">
      <div class="subscription-pros--default__header">
        <SearchDefault
          :model-value="settingsStore.subscriptionPros.searchTerm"
          placeholder="Buscar subscripciones PRO..."
          class="subscription-pros--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="subscription-pros--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="subscription-pros--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="item in allItems" :key="item.id">
            <TableCell>{{ item.id }}</TableCell>
            <TableCell>
              <div class="subscription-pros--default__email">
                {{ item.user?.email || "-" }}
              </div>
            </TableCell>
            <TableCell>
              {{
                item.card_type && item.card_last4
                  ? `${item.card_type} ****${item.card_last4}`
                  : "-"
              }}
            </TableCell>
            <TableCell>
              <BadgeDefault variant="outline">
                {{ item.pending_invoice ? "Sí" : "No" }}
              </BadgeDefault>
            </TableCell>
            <TableCell>{{ formatDate(item.createdAt) }}</TableCell>
            <TableCell align="right">
              <div class="subscription-pros--default__actions">
                <button
                  class="subscription-pros--default__action"
                  title="Ver subscripción PRO"
                  @click="handleViewItem(item.id)"
                >
                  <Eye class="subscription-pros--default__action__icon" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="allItems.length === 0 && !loading"
          class="subscription-pros--default__empty"
        >
          <p>No se encontraron subscripciones PRO</p>
        </div>

        <div v-if="loading" class="subscription-pros--default__loading">
          <p>Cargando subscripciones PRO...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.subscriptionPros.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.subscriptionPros.pageSize"
        class="subscription-pros--default__pagination"
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
import { Eye } from "lucide-vue-next";
import { formatDate } from "@/utils/date";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";
import type { SubscriptionPro } from "@/types/subscription-pro";

const settingsStore = useSettingsStore();
const section = "subscriptionPros" as const;

const filters = computed(() => settingsStore.getSubscriptionProsFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const apiClient = useApiClient();
const allItems = ref<SubscriptionPro[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const fetchItems = async () => {
  try {
    loading.value = true;

    const searchParams: Record<string, unknown> = {
      pagination: {
        page: settingsStore.subscriptionPros.currentPage,
        pageSize: settingsStore.subscriptionPros.pageSize,
      },
      sort: settingsStore.subscriptionPros.sortBy,
      populate: { user: { fields: ["email", "username"] } },
    };

    if (settingsStore.subscriptionPros.searchTerm) {
      searchParams.filters = {
        $or: [
          {
            user: {
              email: {
                $containsi: settingsStore.subscriptionPros.searchTerm,
              },
            },
          },
          {
            card_last4: {
              $containsi: settingsStore.subscriptionPros.searchTerm,
            },
          },
        ],
      };
    }

    const response = (await apiClient("subscription-pros", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    })) as {
      data: SubscriptionPro[];
      meta: { pagination: typeof paginationMeta.value };
    };
    allItems.value = Array.isArray(response.data)
      ? (response.data as SubscriptionPro[])
      : [];
    paginationMeta.value = (response.meta?.pagination ||
      null) as typeof paginationMeta.value;
  } catch (error) {
    console.error("Error fetching subscription-pros:", error);
    allItems.value = [];
  } finally {
    loading.value = false;
  }
};

const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

const tableColumns = [
  { label: "ID" },
  { label: "Usuario" },
  { label: "Tarjeta" },
  { label: "Factura pendiente" },
  { label: "Fecha de creación" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "user.email:asc", label: "Usuario A-Z" },
  { value: "pending_invoice:desc", label: "Pendiente primero" },
];

const router = useRouter();

const handleViewItem = (itemId: number) => {
  router.push(`/users/subscription-pros/${itemId}`);
};

watch(
  [
    () => settingsStore.subscriptionPros.searchTerm,
    () => settingsStore.subscriptionPros.sortBy,
    () => settingsStore.subscriptionPros.pageSize,
    () => settingsStore.subscriptionPros.currentPage,
  ],
  () => {
    fetchItems();
  },
  { immediate: true },
);
</script>
