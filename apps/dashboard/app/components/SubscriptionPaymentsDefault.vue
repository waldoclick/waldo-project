<template>
  <section class="subscription-payments subscription-payments--default">
    <div class="subscription-payments--default__container">
      <div class="subscription-payments--default__header">
        <SearchDefault
          :model-value="settingsStore.subscriptionPayments.searchTerm"
          placeholder="Buscar pagos de subscripción..."
          class="subscription-payments--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="subscription-payments--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="subscription-payments--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="item in allItems" :key="item.id">
            <TableCell>{{ item.id }}</TableCell>
            <TableCell>
              <div class="subscription-payments--default__email">
                {{ item.user?.email || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatCurrency(item.amount) }}</TableCell>
            <TableCell>
              <BadgeDefault :variant="statusVariant(item.status)">
                {{ item.status }}
              </BadgeDefault>
            </TableCell>
            <TableCell>
              {{ formatDate(item.period_start ?? undefined) }} →
              {{ formatDate(item.period_end ?? undefined) }}
            </TableCell>
            <TableCell>
              {{ item.charged_at ? formatDate(item.charged_at) : "-" }}
            </TableCell>
            <TableCell>{{ item.charge_attempts }}</TableCell>
            <TableCell align="right">
              <div class="subscription-payments--default__actions">
                <button
                  class="subscription-payments--default__action"
                  title="Ver pago de subscripción"
                  @click="handleViewItem(item.id)"
                >
                  <Eye class="subscription-payments--default__action__icon" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="allItems.length === 0 && !loading"
          class="subscription-payments--default__empty"
        >
          <p>No se encontraron pagos de subscripción</p>
        </div>

        <div v-if="loading" class="subscription-payments--default__loading">
          <p>Cargando pagos de subscripción...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.subscriptionPayments.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.subscriptionPayments.pageSize"
        class="subscription-payments--default__pagination"
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
import { formatCurrency } from "@/utils/price";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";
import type {
  SubscriptionPayment,
  SubscriptionPaymentStatus,
} from "@/types/subscription-payment";

const settingsStore = useSettingsStore();
const section = "subscriptionPayments" as const;

const filters = computed(() => settingsStore.getSubscriptionPaymentsFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const statusVariant = (
  status: SubscriptionPaymentStatus,
): "default" | "outline" | "secondary" => {
  if (status === "approved") return "default";
  if (status === "failed") return "secondary";
  return "outline";
};

const apiClient = useApiClient();
const allItems = ref<SubscriptionPayment[]>([]);
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
        page: settingsStore.subscriptionPayments.currentPage,
        pageSize: settingsStore.subscriptionPayments.pageSize,
      },
      sort: settingsStore.subscriptionPayments.sortBy,
      populate: { user: { fields: ["email", "username"] } },
    };

    if (settingsStore.subscriptionPayments.searchTerm) {
      searchParams.filters = {
        $or: [
          {
            user: {
              email: {
                $containsi: settingsStore.subscriptionPayments.searchTerm,
              },
            },
          },
          {
            parent_buy_order: {
              $containsi: settingsStore.subscriptionPayments.searchTerm,
            },
          },
          {
            child_buy_order: {
              $containsi: settingsStore.subscriptionPayments.searchTerm,
            },
          },
        ],
      };
    }

    const response = (await apiClient("subscription-payments", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    })) as {
      data: SubscriptionPayment[];
      meta: { pagination: typeof paginationMeta.value };
    };
    allItems.value = Array.isArray(response.data)
      ? (response.data as SubscriptionPayment[])
      : [];
    paginationMeta.value = (response.meta?.pagination ||
      null) as typeof paginationMeta.value;
  } catch (error) {
    console.error("Error fetching subscription-payments:", error);
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
  { label: "Monto" },
  { label: "Estado" },
  { label: "Período" },
  { label: "Cobrado" },
  { label: "Intentos" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "charged_at:desc", label: "Cobrado (más reciente)" },
  { value: "amount:desc", label: "Monto mayor a menor" },
  { value: "amount:asc", label: "Monto menor a mayor" },
  { value: "status:asc", label: "Estado A-Z" },
];

const router = useRouter();

const handleViewItem = (itemId: number) => {
  router.push(`/users/subscription-payments/${itemId}`);
};

watch(
  [
    () => settingsStore.subscriptionPayments.searchTerm,
    () => settingsStore.subscriptionPayments.sortBy,
    () => settingsStore.subscriptionPayments.pageSize,
    () => settingsStore.subscriptionPayments.currentPage,
  ],
  () => {
    fetchItems();
  },
  { immediate: true },
);
</script>
