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
          <TableRow v-for="order in paginatedOrders" :key="order.id">
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
              <button
                class="orders--default__action"
                title="Ver orden"
                @click="handleViewOrder(order.id)"
              >
                <Eye class="orders--default__action__icon" />
              </button>
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
        class="orders--default__pagination"
        @page-change="
          (page: number) => settingsStore.setCurrentPage(section, page)
        "
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
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
  amount: number;
  payment_method: string;
  is_invoice: boolean;
  createdAt: string;
  user?: { username: string };
  ad?: { name: string } | null;
}

// Store de settings
const settingsStore = useSettingsStore();
const section = "orders" as const;

// Computed para los filtros de órdenes
const filters = computed(() => settingsStore.getOrdersFilters);

// Handler para cambios en filtros
const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

// Mock data - esto se reemplazará con datos reales de Strapi
const allOrders = ref<Order[]>([
  {
    id: 5,
    amount: 50,
    payment_method: "webpay",
    is_invoice: true,
    createdAt: "2025-12-15T01:05:00.000Z",
    user: { username: "contacto" },
    ad: null,
  },
  {
    id: 4,
    amount: 50,
    payment_method: "webpay",
    is_invoice: true,
    createdAt: "2025-10-30T02:14:00.000Z",
    user: { username: "contacto" },
    ad: null,
  },
  {
    id: 3,
    amount: 50,
    payment_method: "webpay",
    is_invoice: true,
    createdAt: "2025-10-28T20:22:00.000Z",
    user: { username: "waldo.development" },
    ad: { name: "Tractor" },
  },
  {
    id: 2,
    amount: 50,
    payment_method: "webpay",
    is_invoice: false,
    createdAt: "2025-10-14T20:39:00.000Z",
    user: { username: "geokym" },
    ad: { name: "Leandra Walters" },
  },
  {
    id: 1,
    amount: 50,
    payment_method: "webpay",
    is_invoice: false,
    createdAt: "2025-10-14T20:27:00.000Z",
    user: { username: "geokym" },
    ad: { name: "Asher Mcintyre" },
  },
]);

// Filtrar órdenes por búsqueda
const filteredOrders = computed(() => {
  if (!settingsStore.orders.searchTerm) {
    return allOrders.value;
  }

  const search = settingsStore.orders.searchTerm.toLowerCase();
  return allOrders.value.filter((order) => {
    const orderId = order.id.toString();
    const username = order.user?.username?.toLowerCase() || "";
    const adName = order.ad?.name?.toLowerCase() || "";
    const buyOrder = orderId; // En un caso real, esto sería order.buy_order

    return (
      orderId.includes(search) ||
      username.includes(search) ||
      adName.includes(search) ||
      buyOrder.includes(search)
    );
  });
});

// Ordenar órdenes
const sortedOrders = computed(() => {
  const orders = [...filteredOrders.value];
  const [field, direction] = settingsStore.orders.sortBy.split(":");

  return orders.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (field === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    } else if (field === "ad.name") {
      aValue = a.ad?.name || "";
      bValue = b.ad?.name || "";
    } else {
      aValue = a[field as keyof Order];
      bValue = b[field as keyof Order];
    }

    if (direction === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
});

// Paginar órdenes
const totalPages = computed(() => {
  return Math.ceil(sortedOrders.value.length / settingsStore.orders.pageSize);
});

const paginatedOrders = computed(() => {
  const start =
    (settingsStore.orders.currentPage - 1) * settingsStore.orders.pageSize;
  const end = start + settingsStore.orders.pageSize;
  return sortedOrders.value.slice(start, end);
});

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

const handleViewOrder = (orderId: number) => {
  // Navegar a la página de detalle de la orden
  console.log("View order:", orderId);
};
</script>
