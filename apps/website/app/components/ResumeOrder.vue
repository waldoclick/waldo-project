<template>
  <section class="resume resume--order">
    <div class="resume--order__container">
      <div
        v-if="showIcon || title || description"
        class="resume--order__header"
      >
        <div v-if="showIcon" class="resume--order__header__icon">
          <IconCheckCircle :size="24" />
        </div>
        <h1 v-if="title" class="resume--order__header__title title">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="resume--order__header__description paragraph"
        >
          {{ description }}
        </p>
      </div>

      <client-only>
        <template v-if="summary">
          <!-- Bloque: Comprobante de pago -->
          <div class="resume--order__box">
            <div class="resume--order__subtitle">
              <h2 class="resume--order__subtitle__title">
                Comprobante de pago
              </h2>
            </div>
            <div class="resume--order__details">
              <div class="resume--order__grid">
                <CardInfo
                  title="N° de comprobante"
                  :description="summary.documentId || '-'"
                />
                <CardInfo
                  title="Monto pagado"
                  :description="
                    getFormattedPrice(summary.amount, summary.currency)
                  "
                />
                <CardInfo
                  title="Estado del pago"
                  :description="summary.status || '-'"
                />
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
                  :description="summary.createdAt"
                />
              </div>
            </div>
          </div>

          <!-- Bloque: Información del comprador -->
          <div class="resume--order__box">
            <div class="resume--order__subtitle">
              <h2 class="resume--order__subtitle__title">
                Información del comprador
              </h2>
            </div>
            <div class="resume--order__details">
              <div class="resume--order__grid">
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

<script setup>
import { computed, ref, watch } from "vue";
import { useCategoriesStore } from "@/stores/categories.store";
import { useCommunesStore } from "@/stores/communes.store";
import { useConditionsStore } from "@/stores/conditions.store";
import { CheckCircle as IconCheckCircle } from "lucide-vue-next";
import iconEdit from "/images/icon-edit.svg";
import { useImageProxy } from "@/composables/useImage";

const config = useRuntimeConfig();
const { transformUrl } = useImageProxy();

const props = defineProps({
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

// No ad-related stores needed for pure order receipt

// Utilidad para formato moneda CLP
const getFormattedPrice = (price, currency = "CLP") => {
  if (!price && price !== 0) return "No especificado";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency,
  }).format(price || 0);
};

// Load resolved names when summary prop becomes available (or immediately if already set).
// Uses watch({ immediate: true }) instead of onMounted so it also re-runs if parent
// passes a new summary (e.g., after ad creation redirect).
watch(
  () => props.summary,
  async (summary) => {
    if (!summary) return;
    try {
      if (summary.category) {
        categoryName.value = "Cargando categoría...";
        const categoryData = await adCategory.getCategoryById(summary.category);
        categoryName.value = categoryData?.name || "Categoría no encontrada";
      }

      if (summary.commune) {
        communeInfo.value = "Cargando ubicación...";
        const communeData = await communesStore.getCommuneById(summary.commune);
        const regionData = communeData?.region;
        communeInfo.value = regionData
          ? `${communeData.name}, ${regionData.name}`
          : communeData?.name || "Ubicación no encontrada";
      }

      if (summary.condition) {
        conditionName.value = "Cargando condición...";
        const conditionData = await conditionsStore.getConditionById(
          summary.condition,
        );
        conditionName.value = conditionData?.name || "Condición no encontrada";
      }
    } catch (error) {
      console.error("Error loading summary data:", error);
      if (categoryName.value === "Cargando categoría...") {
        categoryName.value = "Error al cargar categoría";
      }
      if (communeInfo.value === "Cargando ubicación...") {
        communeInfo.value = "Error al cargar ubicación";
      }
      if (conditionName.value === "Cargando condición...") {
        conditionName.value = "Error al cargar condición";
      }
    }
  },
  { immediate: true },
);
</script>
