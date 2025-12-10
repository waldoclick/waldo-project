<template>
  <article class="card card--order">
    <div class="card--order__header">
      <!-- <pre>{{ order }}</pre> -->
      <div class="card--order__document-type">
        <div
          class="card--order__document-type__badge"
          :class="{ 'is-invoice': order.is_invoice }"
        >
          <IconFileText :size="16" class="card--order__document-type__icon" />
          <span>{{ order.is_invoice ? "Factura" : "Boleta" }}</span>
        </div>
      </div>
      <div class="card--order__title">Orden #{{ order.id }}</div>
      <div class="card--order__date">
        {{ formatDate(order.createdAt) }}
      </div>
      <!-- <div class="card--order__status">
        {{ getStatusText(order.status) }}
      </div> -->
    </div>
    <div class="card--order__content">
      <div class="card--order__amount">
        {{ formatPrice(order.amount) }}
      </div>
      <a
        v-if="order.document_response?.return?.enlaces?.dte_pdf"
        :href="order.document_response.return.enlaces.dte_pdf"
        target="_blank"
        rel="noopener noreferrer"
        class="card--order__link btn btn--announcement"
      >
        Ver documento
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
import { FileText as IconFileText } from "lucide-vue-next";

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
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

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "Pendiente",
    processing: "Procesando",
    paid: "Pagado",
    completed: "Completado",
    canceled: "Cancelado",
  };
  return statusMap[status] || status;
};
</script>
