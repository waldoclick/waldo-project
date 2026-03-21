<template>
  <section class="resume resume--pro">
    <div class="resume--pro__container">
      <div v-if="showIcon || title || description" class="resume--pro__header">
        <div v-if="showIcon" class="resume--pro__header__icon">
          <IconCheckCircle :size="24" />
        </div>
        <h1 v-if="title" class="resume--pro__header__title title">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="resume--pro__header__description paragraph"
        >
          {{ description }}
        </p>
      </div>

      <client-only>
        <template v-if="summary">
          <!-- Bloque: Comprobante de pago -->
          <div class="resume--pro__box">
            <div class="resume--pro__subtitle">
              <h2 class="resume--pro__subtitle__title">Comprobante de pago</h2>
            </div>
            <div class="resume--pro__details">
              <div class="resume--pro__grid">
                <CardInfo
                  title="Monto pagado"
                  :description="
                    getFormattedPrice(summary.amount, summary.currency)
                  "
                />
                <CardInfo title="Estado del pago" description="Pagado" />
                <CardInfo
                  v-if="summary.paymentMethod"
                  title="Método de pago"
                  :description="summary.paymentMethod"
                />
                <CardInfo
                  v-if="summary.receiptNumber"
                  title="Recibo Webpay"
                  :description="summary.receiptNumber"
                />
                <CardInfo
                  v-if="summary.createdAt"
                  title="Fecha de pago"
                  :description="formatDate(summary.createdAt)"
                />
                <CardInfo
                  title="Código de autorización"
                  :description="summary.authorizationCode ?? 'No disponible'"
                />
                <CardInfo
                  title="Tipo de pago"
                  :description="summary.paymentType ?? 'No disponible'"
                />
                <CardInfo
                  title="Últimos 4 dígitos"
                  :description="summary.cardLast4 ?? 'No disponible'"
                />
              </div>
            </div>
          </div>

          <!-- Bloque: Información del comprador -->
          <div class="resume--pro__box">
            <div class="resume--pro__subtitle">
              <h2 class="resume--pro__subtitle__title">
                Información del comprador
              </h2>
            </div>
            <div class="resume--pro__details">
              <div class="resume--pro__grid">
                <CardInfo
                  title="Nombre"
                  :description="summary.fullName || '-'"
                />
                <CardInfo
                  title="Correo electrónico"
                  :description="summary.email || '-'"
                />
              </div>
            </div>
          </div>
        </template>
      </client-only>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CheckCircle as IconCheckCircle } from "lucide-vue-next";

defineProps({
  showIcon: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  summary: {
    type: Object,
    default: () => null,
  },
  hidePaymentSection: {
    type: Boolean,
    default: false,
  },
});

// Format currency amount as CLP
const getFormattedPrice = (
  price: number | null | undefined,
  currency = "CLP",
) => {
  if (!price && price !== 0) return "No especificado";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency,
  }).format(price || 0);
};

// Format ISO date string to human-readable Spanish date+time
const formatDate = (isoString: string | null | undefined) => {
  if (!isoString) return "-";
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
};
</script>
