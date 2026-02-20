<template>
  <div ref="dropdownRef" class="dropdown dropdown--sales">
    <button
      ref="triggerRef"
      type="button"
      class="dropdown--sales__trigger"
      title="Últimas órdenes"
      @click="open = !open"
    >
      <ShoppingBag :size="20" class="dropdown--sales__trigger__icon" />
    </button>
    <div v-if="open" ref="panelRef" class="dropdown--sales__panel">
      <div class="dropdown--sales__panel__head">
        <h3 class="dropdown--sales__panel__title">Últimas órdenes</h3>
        <NuxtLink
          to="/ordenes"
          class="dropdown--sales__panel__link"
          @click="open = false"
        >
          Ver todas
          <ExternalLink :size="12" class="dropdown--sales__panel__link__icon" />
        </NuxtLink>
      </div>
      <div
        class="dropdown--sales__panel__body dropdown--sales__panel__body--no-scroll"
      >
        <p v-if="loading" class="dropdown--sales__panel__message">
          Cargando...
        </p>
        <p
          v-else-if="!loading && orders.length === 0"
          class="dropdown--sales__panel__message"
        >
          No hay órdenes
        </p>
        <NuxtLink
          v-for="(order, index) in orders"
          :key="order.id"
          :to="`/ordenes/${order.id}`"
          class="dropdown--sales__list__item"
          :class="{
            'dropdown--sales__list__item--border': index < orders.length - 1,
          }"
          @click="open = false"
        >
          <div class="dropdown--sales__list__item__main">
            <span class="dropdown--sales__list__item__title">
              {{ order.buy_order || `Orden #${order.id}` }}
            </span>
            <span class="dropdown--sales__list__item__meta">
              {{ order.user?.username || order.user?.email || "Usuario" }} •
              {{ formatTime(order.createdAt) }}
            </span>
          </div>
          <span class="dropdown--sales__list__item__amount">
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
const dropdownRef = ref<HTMLElement | null>(null);
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
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node) &&
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
