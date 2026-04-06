<template>
  <section class="orders orders--default">
    <div class="orders--default__container">
      <div class="orders--default__header">
        <SearchDefault
          :model-value="settingsStore.orders.searchTerm"
          placeholder="Buscar órdenes..."
          class="orders--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="orders--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="orders--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow
            v-for="order in paginatedOrders"
            :key="order.documentId ?? order.id"
          >
            <TableCell>{{ order.id }}</TableCell>
            <TableCell>{{ order.user?.username || "-" }}</TableCell>
            <TableCell>{{ order.ad?.name || "-" }}</TableCell>
            <TableCell>{{ formatCurrency(order.amount) }}</TableCell>
            <TableCell>
              <BadgeDefault>{{
                getPaymentMethod(order.payment_method)
              }}</BadgeDefault>
            </TableCell>
            <TableCell>
              <BadgeDefault :variant="order.is_invoice ? 'default' : 'outline'">
                {{ order.is_invoice ? "Factura" : "Boleta" }}
              </BadgeDefault>
            </TableCell>
            <TableCell>{{ formatDate(order.createdAt) }}</TableCell>
            <TableCell align="right">
              <NuxtLink
                class="orders--default__action"
                title="Ver orden"
                :to="`/orders/${order.id}`"
              >
                <Eye class="orders--default__action__icon" />
              </NuxtLink>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedOrders.length === 0 && !loading"
          class="orders--default__empty"
        >
          <p>No se encontraron órdenes</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.orders.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.orders.pageSize"
        class="orders--default__pagination"
        @page-change="
          (page: number) => settingsStore.setCurrentPage(section, page)
        "
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Eye } from "lucide-vue-next";
import { formatCurrency } from "@/utils/price";
import { getPaymentMethod } from "@/utils/string";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";
import type { Order } from "@/types/order";

const settingsStore = useSettingsStore();
const section = "orders" as const;
const apiClient = useApiClient();

const filters = computed(() => settingsStore.getOrdersFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const allOrders = ref<Order[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const fetchOrders = async () => {
  try {
    loading.value = true;
    const sectionSettings = settingsStore.orders;
    const [field, direction] = sectionSettings.sortBy.split(":");

    const searchParams: Record<string, unknown> = {
      pagination: {
        page: sectionSettings.currentPage,
        pageSize: sectionSettings.pageSize,
      },
      sort: `${field}:${direction}`,
      populate: ["user", "ad"],
    };

    if (sectionSettings.searchTerm) {
      searchParams.filters = {
        $or: [
          { user: { username: { $containsi: sectionSettings.searchTerm } } },
          { ad: { name: { $containsi: sectionSettings.searchTerm } } },
          { buy_order: { $containsi: sectionSettings.searchTerm } },
        ],
      };
    }

    const response = (await apiClient("orders", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    })) as {
      data?: Order[];
      meta?: {
        pagination?: { page: number; pageCount?: number; total: number };
      };
    };

    allOrders.value = Array.isArray(response.data) ? response.data : [];
    const pagination = response.meta?.pagination;
    const total = pagination?.total ?? 0;
    const pageSize = sectionSettings.pageSize;
    const pageCount =
      pagination?.pageCount ?? (Math.ceil(total / pageSize) || 1);
    paginationMeta.value = {
      page: pagination?.page ?? 1,
      pageSize,
      pageCount,
      total,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    allOrders.value = [];
    paginationMeta.value = null;
  } finally {
    loading.value = false;
  }
};

const paginatedOrders = computed(() => allOrders.value);
const totalPages = computed(() => paginationMeta.value?.pageCount ?? 0);
const totalRecords = computed(() => paginationMeta.value?.total ?? 0);

// watch(immediate: true) is the sole data-loading trigger — not onMounted
watch(
  [
    () => settingsStore.orders.searchTerm,
    () => settingsStore.orders.sortBy,
    () => settingsStore.orders.pageSize,
    () => settingsStore.orders.currentPage,
  ],
  () => {
    fetchOrders();
  },
  { immediate: true },
);

const tableColumns = [
  { label: "Orden" },
  { label: "Cliente" },
  { label: "Anuncio" },
  { label: "Monto" },
  { label: "Método de Pago" },
  { label: "Tipo" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "ad.name:asc", label: "Título A-Z" },
  { value: "ad.name:desc", label: "Título Z-A" },
];
</script>
