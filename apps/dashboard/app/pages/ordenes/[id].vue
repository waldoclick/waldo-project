<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Resumen" :columns="2">
        <CardInfo v-if="order" title="ID" :description="String(order.id)" />
        <CardInfo
          v-if="order"
          title="Monto"
          :description="formatCurrency(order.amount)"
        />
        <CardInfo
          v-if="order"
          title="Método de pago"
          :description="getPaymentMethod(order.payment_method)"
        />
        <CardInfo
          v-if="order"
          title="Documento"
          :description="order.is_invoice ? 'Factura' : 'Boleta'"
        />
        <CardInfo
          v-if="order"
          title="Fecha"
          :description="formatDate(order.createdAt)"
        />
      </BoxInformation>

      <BoxInformation v-if="order?.user" title="Cliente" :columns="2">
        <CardInfo title="Usuario" :description="order.user?.username || '--'" />
        <CardInfo title="Email" :description="order.user?.email || '--'" />
        <CardInfo title="Nombre" :description="formatFullName(order.user)" />
        <CardInfo title="Teléfono" :description="order.user?.phone || '--'" />
      </BoxInformation>

      <BoxInformation v-if="order?.ad" title="Anuncio" :columns="2">
        <CardInfo title="Nombre" :description="order.ad?.name || '--'" />
        <CardInfo title="Slug" :description="order.ad?.slug || '--'" />
        <CardInfo title="ID" :description="order.ad?.id || '--'" />
      </BoxInformation>

      <BoxInformation
        v-if="order?.items || order?.payment_response"
        title="Detalle de pago"
        :columns="1"
      >
        <CardInfo
          v-if="order?.items"
          title="Items"
          :description="order.items"
          show-copy-button
        />
        <CardInfo
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
        <CardInfo
          v-if="order?.document_details"
          title="Detalle"
          :description="order.document_details"
          show-copy-button
        />
        <CardInfo
          v-if="order?.document_response"
          title="Respuesta"
          :description="order.document_response"
          show-copy-button
        />
      </BoxInformation>
    </template>
    <template #sidebar>
      <BoxInformation title="Detalles" :columns="1">
        <CardInfo
          v-if="order"
          title="Fecha de creación"
          :description="formatDate(order.createdAt)"
        />
        <CardInfo
          v-if="order"
          title="Última modificación"
          :description="formatDate(order.updatedAt)"
        />
      </BoxInformation>
    </template>
  </BoxContent>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const orderId = computed(() => String(route.params.id || ""));
const order = ref<any>(null);
const strapi = useStrapi();

const title = computed(() =>
  orderId.value ? `Orden #${orderId.value}` : "Orden",
);
const breadcrumbs = computed(() => [
  { label: "Órdenes", to: "/ordenes" },
  ...(orderId.value ? [{ label: `#${orderId.value}` }] : []),
]);

const formatCurrency = (amount: number | string) => {
  const numAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (!numAmount) return "--";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPaymentMethod = (method: string | undefined) => {
  if (!method) return "--";
  return method === "webpay" ? "WebPay" : method;
};

const formatFullName = (user: any) => {
  if (!user) return "--";
  const name = [user.firstname, user.lastname].filter(Boolean).join(" ");
  return name || "--";
};

const normalizeOrder = (response: any) => {
  if (!response) return null;
  if (response.data) return response.data;
  if (response.order) return response.order;
  if (response.id) return response;
  return null;
};

const { data: orderData } = await useAsyncData(
  `order-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;
    try {
      const response = await strapi.findOne("orders", id as string, {
        populate: { user: true, ad: true },
      });
      return normalizeOrder(response);
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  },
);

order.value = orderData.value;
</script>
