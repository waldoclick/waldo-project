<template>
  <div>
    <HeroDefaultDashboard :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Resumen" :columns="2">
          <CardInfoDashboard
            v-if="order"
            title="ID"
            :description="String(order.id)"
          />
          <CardInfoDashboard
            v-if="order"
            title="Monto"
            :description="formatCurrency(order.amount)"
          />
          <CardInfoDashboard
            v-if="order"
            title="Método de pago"
            :description="getPaymentMethod(order.payment_method)"
          />
          <CardInfoDashboard
            v-if="order"
            title="Documento"
            :description="order.is_invoice ? 'Factura' : 'Boleta'"
          />
          <CardInfoDashboard
            v-if="order"
            title="Fecha"
            :description="formatDate(order.createdAt)"
          />
        </BoxInformation>

        <BoxInformation v-if="order?.user" title="Cliente" :columns="2">
          <CardInfoDashboard
            title="Usuario"
            :description="order.user?.username || '--'"
          />
          <CardInfoDashboard
            title="Correo electrónico"
            :description="order.user?.email || '--'"
          />
          <CardInfoDashboard
            title="Nombre"
            :description="
              formatFullName(order.user?.firstname, order.user?.lastname)
            "
          />
          <CardInfoDashboard
            title="Teléfono"
            :description="order.user?.phone || '--'"
          />
        </BoxInformation>

        <BoxInformation v-if="order?.ad" title="Anuncio" :columns="2">
          <CardInfoDashboard
            title="Nombre"
            :description="order.ad?.name || '--'"
          />
          <CardInfoDashboard
            title="Slug"
            :description="order.ad?.slug || '--'"
          />
          <CardInfoDashboard title="ID" :description="order.ad?.id || '--'" />
        </BoxInformation>

        <BoxInformation
          v-if="order?.items || order?.payment_response"
          title="Detalle de pago"
          :columns="1"
        >
          <CardInfoDashboard
            v-if="order?.items"
            title="Items"
            :description="order.items"
            show-copy-button
          />
          <CardInfoDashboard
            v-if="order?.payment_response"
            title="Respuesta de pago"
            :description="order.payment_response"
            show-copy-button
          />
        </BoxInformation>

        <BoxInformation
          v-if="order?.document_details || order?.document_response"
          title="Documento tributario"
          :columns="1"
        >
          <CardInfoDashboard
            v-if="order?.document_details"
            title="Detalle"
            :description="order.document_details"
            show-copy-button
          />
          <CardInfoDashboard
            v-if="order?.document_response"
            title="Respuesta"
            :description="order.document_response"
            show-copy-button
          />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfoDashboard
            v-if="order"
            title="Fecha de creación"
            :description="formatDate(order.createdAt)"
          />
          <CardInfoDashboard
            v-if="order"
            title="Última modificación"
            :description="formatDate(order.updatedAt)"
          />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { formatCurrency } from "@/utils/price";
import { formatFullName, getPaymentMethod } from "@/utils/string";
import type { Order } from "@/types/order";
import { formatDate } from "@/utils/date";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const orderId = computed(() => String(route.params.id || ""));
const order = ref<Order | null>(null);
const apiClient = useApiClient();

const title = computed(() =>
  orderId.value ? `Orden #${orderId.value}` : "Orden",
);
const breadcrumbs = computed(() => [
  { label: "Órdenes", to: "/dashboard/orders" },
  ...(orderId.value ? [{ label: `#${orderId.value}` }] : []),
]);

const normalizeOrder = (response: unknown): Order | null => {
  if (!response) return null;
  if (typeof response === "object" && response !== null) {
    if ("data" in response) return (response as { data: Order }).data;
    if ("order" in response) return (response as { order: Order }).order;
    if ("id" in response) return response as Order;
  }
  return null;
};

const { data: orderData } = await useAsyncData(
  `order-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;
    try {
      const response = await apiClient(`orders/${id}`, {
        method: "GET",
        params: { populate: { user: true, ad: true } } as unknown as Record<
          string,
          unknown
        >,
      });
      return normalizeOrder(response);
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  },
);

order.value = orderData.value ?? null;
</script>
