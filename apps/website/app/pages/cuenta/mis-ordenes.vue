<template>
  <section class="page">
    <AccountOrders
      :intro-text="'Aquí podrás ver tus órdenes de compra, revisar su estado y dar seguimiento a tus pagos.'"
      :orders="orders"
      :current-page="currentPage"
      :pagination="pagination"
      :is-loading="isLoading"
      @page-change="handlePageChange"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user.store";
import AccountOrders from "@/components/AccountOrders.vue";

interface Order {
  id: number;
  status: string;
  total: number;
  amount: number;
  is_invoice: boolean;
  createdAt: string;
  updatedAt: string;
}

const orders = ref<Order[]>([]);
const currentPage = ref(1);
const pagination = ref({ total: 0, pageSize: 10 });
const isLoading = ref(false);

const userStore = useUserStore();

const loadOrders = async () => {
  isLoading.value = true;
  try {
    const response = await userStore.loadUserOrders(
      {}, // Sin filtros específicos por estatus
      { page: currentPage.value, pageSize: pagination.value.pageSize },
      ["createdAt:desc"] as never[],
    );

    if (response) {
      orders.value = response.data as unknown as Order[];
      pagination.value.total = response.meta.pagination.total;
    }
  } catch (error) {
    console.error("Error loading orders:", error);
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadOrders();
};

useAsyncData(async () => {
  await loadOrders();
});

definePageMeta({
  layout: "account",
  middleware: "auth",
});
</script>
