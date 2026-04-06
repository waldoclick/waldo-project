<template>
  <div>
    <HeroDefault title="Órdenes" :breadcrumbs="breadcrumbs">
      <template #actions>
        <button
          class="btn btn--outline"
          :disabled="isExporting"
          title="Exportar CSV"
          @click="exportOrders"
        >
          <Download :size="16" />
        </button>
      </template>
    </HeroDefault>
    <OrdersDefault />
  </div>
</template>

<script setup lang="ts">
import { Download } from "lucide-vue-next";
import HeroDefault from "@/components/HeroDefault.vue";
import OrdersDefault from "@/components/OrdersDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Órdenes" }];
const { exportOrders, isExporting } = useExportCsv();
</script>
