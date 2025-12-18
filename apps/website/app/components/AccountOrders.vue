<template>
  <section class="account account--orders" aria-labelledby="orders-title">
    <h2 id="orders-title" class="account--orders__title title">Mis órdenes</h2>

    <div class="account--orders__subtitle">
      {{ introText }}
    </div>

    <div class="account--orders__list">
      <!-- órdenes -->
      <div class="account--orders__list__items">
        <div
          v-if="isLoading"
          class="account--orders__loading"
          aria-live="polite"
        >
          <div class="account--orders__list__items__sr-only">
            Cargando órdenes
          </div>
          <LoadingDefault />
        </div>

        <div
          v-if="!isLoading && orders.length > 0"
          class="account--orders__list__items__wrapper"
        >
          <CardOrder v-for="order in orders" :key="order.id" :order="order" />

          <div
            v-if="pagination.total > pagination.pageSize"
            class="account--orders__list__items__paginate"
          >
            <div class="paginate" aria-label="Paginación">
              <vue-awesome-paginate
                :model-value="currentPage"
                :total-items="pagination.total"
                :items-per-page="pagination.pageSize"
                :max-pages-shown="5"
                @update:model-value="$emit('page-change', $event)"
              />
            </div>
          </div>
        </div>

        <div
          v-if="!isLoading && orders.length === 0"
          class="account--orders__list__items__emptystate"
        >
          <EmptyState>
            <template #message> No hay órdenes </template>
          </EmptyState>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import CardOrder from "@/components/CardOrder.vue";
import EmptyState from "@/components/EmptyState.vue";
import LoadingDefault from "@/components/LoadingDefault.vue";

// Definir la interfaz para órdenes
interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Permitir cualquier propiedad adicional
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
</script>
