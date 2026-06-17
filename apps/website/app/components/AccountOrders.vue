<template>
  <section class="account account--orders" aria-labelledby="orders-title">
    <header class="account--orders__header">
      <span class="account--orders__header__eyebrow">Cuenta</span>
      <h1 id="orders-title" class="account--orders__header__heading">Mis órdenes</h1>
      <p class="account--orders__header__intro">{{ introText }}</p>
    </header>

    <div class="account--orders__summary">
      <div class="account--orders__summary__card">
        <span class="account--orders__summary__card__label">Total invertido</span>
        <div class="account--orders__summary__card__value">{{ totalInvertido }}</div>
      </div>
      <div class="account--orders__summary__card">
        <span class="account--orders__summary__card__label">Órdenes</span>
        <div class="account--orders__summary__card__value">{{ pagination.total }}</div>
      </div>
      <div class="account--orders__summary__card">
        <span class="account--orders__summary__card__label">Última compra</span>
        <div class="account--orders__summary__card__value">{{ lastPurchase }}</div>
      </div>
    </div>

    <div class="account--orders__table">
      <div class="account--orders__table__head">
        <span class="account--orders__table__head__cell">Orden</span>
        <span class="account--orders__table__head__cell">Concepto</span>
        <span class="account--orders__table__head__cell">Fecha</span>
        <span class="account--orders__table__head__cell">Monto</span>
        <span class="account--orders__table__head__cell account--orders__table__head__cell--action"></span>
      </div>

      <div v-if="isLoading" class="account--orders__loading" aria-live="polite">
        <LoadingDefault />
      </div>

      <template v-if="!isLoading && orders.length > 0">
        <CardOrder v-for="order in orders" :key="order.id" :order="order" />
      </template>

      <div
        v-if="!isLoading && orders.length === 0"
        class="account--orders__empty"
      >
        <EmptyState>
          <template #message>No hay órdenes</template>
        </EmptyState>
      </div>
    </div>

    <div
      v-if="!isLoading && pagination.total > pagination.pageSize"
      class="account--orders__pager"
    >
      <vue-awesome-paginate
        :model-value="currentPage"
        :total-items="pagination.total"
        :items-per-page="pagination.pageSize"
        :max-pages-shown="5"
        @update:model-value="$emit('page-change', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import CardOrder from "@/components/CardOrder.vue";
import EmptyState from "@/components/EmptyState.vue";
import LoadingDefault from "@/components/LoadingDefault.vue";

interface Order {
  id: number;
  status: string;
  total: number;
  amount: number;
  is_invoice: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  pageSize: number;
}

const props = defineProps<{
  orders: Order[];
  currentPage: number;
  pagination: Pagination;
  isLoading: boolean;
  introText: string;
}>();

defineEmits<{
  "page-change": [page: number];
}>();

const totalInvertido = computed(() => {
  const sum = props.orders.reduce((acc, o) => {
    const n = typeof o.amount === "string" ? Number.parseFloat(o.amount) : o.amount;
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(sum);
});

const lastPurchase = computed(() => {
  const first = props.orders[0];
  if (!first) return "—";
  const date = new Date(first.createdAt);
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
});
</script>
