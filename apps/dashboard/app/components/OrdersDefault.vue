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
                :to="`/ordenes/${order.id}`"
              >
                <Eye class="orders--default__action__icon" />
              </NuxtLink>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div v-if="filteredOrders.length === 0" class="orders--default__empty">
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
import { computed } from "vue";
import { useAsyncData } from "nuxt/app";
import { useStrapi } from "#imports";
import { Eye } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

interface Order {
  id: number;
  documentId?: string;
  buy_order?: string;
  amount: number | string;
  payment_method: string;
  is_invoice: boolean;
  createdAt: string;
  user?: { username: string };
  ad?: { name: string } | null;
}

interface OrdersListResponse {
  data: Order[];
  meta: { pagination: { page: number; pageCount: number; total: number } };
}

const settingsStore = useSettingsStore();
const section = "orders" as const;
const strapi = useStrapi();

const filters = computed(() => settingsStore.getOrdersFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const sortParam = computed(() => {
  const [field, direction] = settingsStore.orders.sortBy.split(":");
  return `${field}:${direction}`;
});

const queryKey = computed(
  () =>
    `orders-${settingsStore.orders.currentPage}-${settingsStore.orders.pageSize}-${sortParam.value}`,
);

const { data: ordersResponse } = await useAsyncData(
  queryKey,
  async (): Promise<OrdersListResponse> => {
    try {
      const res = (await strapi.find("orders", {
        pagination: {
          page: settingsStore.orders.currentPage,
          pageSize: settingsStore.orders.pageSize,
        },

        sort: sortParam.value as any,
        populate: ["user", "ad"],
      })) as unknown as {
        data?: Order[];
        meta?: {
          pagination?: { page: number; pageCount?: number; total: number };
        };
      };
      const pagination = res.meta?.pagination;
      const total = pagination?.total ?? 0;
      const pageSize = settingsStore.orders.pageSize;
      const pageCount =
        pagination?.pageCount ?? (Math.ceil(total / pageSize) || 1);
      return {
        data: Array.isArray(res.data) ? res.data : [],
        meta: {
          pagination: {
            page: pagination?.page ?? 1,
            pageCount,
            total,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return {
        data: [],
        meta: { pagination: { page: 1, pageCount: 0, total: 0 } },
      };
    }
  },
);

const orders = computed<Order[]>(() => {
  const data = ordersResponse.value?.data;
  return Array.isArray(data) ? data : [];
});

const totalPages = computed(
  () => ordersResponse.value?.meta?.pagination?.pageCount ?? 0,
);
const totalRecords = computed(
  () => ordersResponse.value?.meta?.pagination?.total ?? 0,
);

const filteredOrders = computed(() => {
  const term = settingsStore.orders.searchTerm?.toLowerCase();
  if (!term) return orders.value;
  return orders.value.filter((order) => {
    const id = String(order.id);
    const username = order.user?.username?.toLowerCase() || "";
    const adName = order.ad?.name?.toLowerCase() || "";
    const buyOrder = (order.buy_order ?? "").toLowerCase();
    return (
      id.includes(term) ||
      username.includes(term) ||
      adName.includes(term) ||
      buyOrder.includes(term)
    );
  });
});

const paginatedOrders = computed(() => filteredOrders.value);

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

const formatCurrency = (amount: number | string) => {
  const numAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

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

const getPaymentMethod = (method: string) => {
  return method === "webpay" ? "WebPay" : method;
};
</script>
