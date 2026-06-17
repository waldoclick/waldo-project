<template>
  <div class="account--orders__row">
    <span class="account--orders__row__order">
      <span class="account--orders__row__order__id">Orden #{{ order.id }}</span>
      <span
        class="account--orders__row__order__doc"
        :class="order.is_invoice ? 'account--orders__row__order__doc--invoice' : 'account--orders__row__order__doc--receipt'"
      >
        <component :is="order.is_invoice ? IconFileCheck : IconFileText" :size="12" />
        {{ order.is_invoice ? "Factura" : "Boleta" }}
      </span>
    </span>
    <span class="account--orders__row__concept">{{ orderConcept }}</span>
    <span class="account--orders__row__date">{{ formatDate(order.createdAt) }}</span>
    <span class="account--orders__row__amount">{{ formatPrice(order.amount) }}</span>
    <span class="account--orders__row__action">
      <a
        v-if="order.document_response?.return?.enlaces?.dte_pdf"
        :href="order.document_response.return.enlaces.dte_pdf"
        target="_blank"
        rel="noopener noreferrer"
        class="account--orders__row__action__btn"
      >
        <IconDownload :size="15" />
        Documento
      </a>
      <span v-else class="account--orders__row__action__empty">—</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Download as IconDownload, FileCheck as IconFileCheck, FileText as IconFileText } from "lucide-vue-next";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  amount: string | number;
  is_invoice: boolean;
  createdAt: string;
  updatedAt: string;
  buy_order?: string;
  payment_method?: string;
  documentId?: string;
  items?: OrderItem[] | null;
  document_response?: {
    return: {
      enlaces: {
        dte_pdf?: string;
        dte_xml?: string;
        dte_timbre?: string;
        dte_pdfcedible?: string;
      };
    };
  };
}

const props = defineProps<{
  order: Order;
}>();

const orderConcept = computed(() => {
  const items = props.order.items;
  if (!items || !Array.isArray(items) || items.length === 0) return "Pago Waldo";
  return items.map((i) => i.name).filter(Boolean).join(", ") || "Pago Waldo";
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatPrice = (price: string | number) => {
  const numericPrice =
    typeof price === "string" ? Number.parseFloat(price) : price;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(numericPrice);
};
</script>
