<template>
  <div ref="menuRef" class="header-icons__dropdown-wrap">
    <button
      ref="triggerRef"
      type="button"
      class="header-icons__trigger"
      title="Últimas órdenes"
      @click="open = !open"
    >
      <ShoppingBag :size="20" class="header-icons__trigger-icon" />
    </button>
    <div
      v-if="open"
      ref="panelRef"
      class="header-icons__panel header-icons__panel--list"
    >
      <div class="header-icons__panel-head">
        <h3 class="header-icons__panel-title">Últimas órdenes</h3>
        <NuxtLink
          to="/ordenes"
          class="header-icons__panel-link"
          @click="open = false"
        >
          Ver todas
          <ExternalLink :size="12" class="header-icons__panel-link-icon" />
        </NuxtLink>
      </div>
      <div class="header-icons__panel-body">
        <p v-if="loading" class="header-icons__panel-message">Cargando...</p>
        <p
          v-else-if="!loading && orders.length === 0"
          class="header-icons__panel-message"
        >
          No hay órdenes
        </p>
        <NuxtLink
          v-for="(order, index) in orders"
          :key="order.id"
          :to="`/ordenes/${order.id}`"
          class="header-icons__list-item"
          :class="{
            'header-icons__list-item--border': index < orders.length - 1,
          }"
          @click="open = false"
        >
          <div class="header-icons__list-item-main">
            <span class="header-icons__list-item-title">
              {{ order.buy_order || `Orden #${order.id}` }}
            </span>
            <span class="header-icons__list-item-meta">
              {{ order.user?.username || order.user?.email || "Usuario" }} •
              {{ formatTime(order.createdAt) }}
            </span>
          </div>
          <span class="header-icons__list-item-amount">
            {{ formatCurrency(order.amount) }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ShoppingBag, ExternalLink } from "lucide-vue-next";

interface Order {
  id: number;
  buy_order?: string;
  amount: number | string;
  createdAt: string;
  user?: { username?: string; email?: string };
}

const strapi = useStrapi();

const open = ref(false);
const loading = ref(true);
const orders = ref<Order[]>([]);
const menuRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const fetchOrders = async () => {
  try {
    loading.value = true;
    const res = (await strapi.find("orders", {
      pagination: { page: 1, pageSize: 10 },
      sort: "createdAt:desc",
      populate: ["user"],
    })) as { data?: Order[] };
    orders.value = Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    orders.value = [];
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number | string, currency = "CLP") => {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target as Node) &&
    open.value
  ) {
    open.value = false;
  }
};

onMounted(() => {
  fetchOrders();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
