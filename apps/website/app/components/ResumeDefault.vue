<template>
  <section class="resume resume--default">
    <div class="resume--default__container">
      <div
        v-if="showIcon || title || description"
        class="resume--default__header"
      >
        <div v-if="showIcon" class="resume--default__header__icon">
          <IconCheckCircle :size="24" />
        </div>
        <h1 v-if="title" class="resume--default__header__title title">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="resume--default__header__description paragraph"
        >
          {{ description }}
        </p>
      </div>

      <client-only>
        <template v-if="summary">
          <!--1. Método de pago -->
          <div v-if="!hidePaymentSection" class="resume--default__box">
            <div class="resume--default__subtitle">
              <h2 class="resume--default__subtitle__title">
                1. Método de pago
              </h2>
              <ButtonEdit
                v-if="summary.showEditLinks"
                :show-edit-links="summary.showEditLinks"
                to="/anunciar?step=1"
                title="Editar Información general"
                :icon-edit="iconEdit"
              />
            </div>
            <div class="resume--default__details">
              <div class="resume--default__grid">
                <CardInfo
                  title="Tipo de anuncio"
                  :description="getPaymentMethodDescription(summary)"
                />
                <CardInfo
                  title="Destacado"
                  :description="getFeaturedDescription(summary.featured)"
                />
                <CardInfo
                  title="Factura"
                  :description="summary.isInvoice ? 'Sí' : 'No'"
                />
                <CardInfo
                  v-if="summary.hasToPay"
                  title="Total"
                  :description="getTotalDescription(summary)"
                />
              </div>
            </div>
          </div>

          <!-- General (1 o 2 según hidePaymentSection) -->
          <div class="resume--default__box">
            <div class="resume--default__subtitle">
              <h2 class="resume--default__subtitle__title">
                {{ hidePaymentSection ? "1" : "2" }}. General
              </h2>
              <ButtonEdit
                v-if="summary.showEditLinks"
                :show-edit-links="summary.showEditLinks"
                to="/anunciar?step=2"
                title="Editar General"
                :icon-edit="iconEdit"
              />
            </div>
            <div class="resume--default__details">
              <div class="resume--default__grid">
                <CardInfo title="Título" :description="summary.title" />
                <CardInfo title="Categoría" :description="categoryName" />
                <CardInfo
                  title="Precio"
                  :description="
                    getFormattedPrice(summary.price, summary.currency)
                  "
                />
                <CardInfo
                  title="Descripción"
                  :description="summary.description"
                />
              </div>
            </div>
          </div>

          <!-- Información personal -->
          <div class="resume--default__box">
            <div class="resume--default__subtitle">
              <h2 class="resume--default__subtitle__title">
                {{ hidePaymentSection ? "2" : "3" }}. Información personal
              </h2>
              <ButtonEdit
                v-if="summary.showEditLinks"
                :show-edit-links="summary.showEditLinks"
                to="/anunciar?step=3"
                title="Editar Información personal"
                :icon-edit="iconEdit"
              />
            </div>
            <div class="resume--default__details">
              <div class="resume--default__grid">
                <CardInfo
                  title="Correo eléctronico"
                  :description="summary.email"
                />
                <CardInfo title="Teléfono" :description="summary.phone" />
                <CardInfo title="Ubicación" :description="communeInfo" />
                <CardInfo
                  title="Dirección"
                  :description="
                    getFullAddress(summary.address, summary.addressNumber)
                  "
                />
              </div>
            </div>
          </div>

          <!-- Ficha del producto -->
          <div class="resume--default__box">
            <div class="resume--default__subtitle">
              <h2 class="resume--default__subtitle__title">
                {{ hidePaymentSection ? "3" : "4" }}. Ficha del producto
              </h2>
              <ButtonEdit
                v-if="summary.showEditLinks"
                :show-edit-links="summary.showEditLinks"
                to="/anunciar?step=4"
                title="Editar Ficha del producto"
                :icon-edit="iconEdit"
              />
            </div>
            <div class="resume--default__details">
              <div class="resume--default__grid">
                <CardInfo title="Condición" :description="conditionName" />
                <CardInfo
                  title="Fabricante"
                  :description="summary.manufacturer"
                />
                <CardInfo title="Modelo" :description="summary.model" />
                <CardInfo
                  title="Número de serie"
                  :description="summary.serialNumber"
                />
                <CardInfo title="Año" :description="summary.year" />
                <CardInfo
                  title="Peso"
                  :description="`${summary.weight} (kg)`"
                />
                <CardInfo
                  title="Medidas"
                  :description="getDimensions(summary)"
                />
              </div>
            </div>
          </div>

          <!-- Galería de imágenes -->
          <div v-if="summary.gallery?.length" class="resume--default__box">
            <div class="resume--default__subtitle">
              <h2 class="resume--default__subtitle__title">
                {{ hidePaymentSection ? "4" : "5" }}. Galería de imágenes
              </h2>
              <ButtonEdit
                v-if="summary.showEditLinks"
                :show-edit-links="summary.showEditLinks"
                to="/anunciar?step=5"
                title="Editar Galería de imágenes"
                :icon-edit="iconEdit"
              />
            </div>
            <div class="resume--default__photos">
              <NuxtImg
                v-for="(image, index) in summary.gallery"
                :key="index"
                :src="getImageUrl(image.url)"
                :alt="image.url"
                :title="image.url"
                loading="lazy"
                class="resume--default__subtitle__img"
                remote
              />
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

// Inicializar stores
const adCategory = useCategoriesStore();
const communesStore = useCommunesStore();
const conditionsStore = useConditionsStore();

// Estado local
const categoryName = ref("");
const communeInfo = ref("");
const conditionName = ref("");

// Métodos auxiliares
const getPackDescription = (pack) => {
  if (!pack) return "No especificado";
  if (pack === "free") return "Usar uno de mis anuncios gratuitos";
  if (pack === "paid") return "Usar uno de mis anuncios de pago";
  return "Comprando un pack de anuncios";
};

const getPaymentMethodDescription = (summary) => {
  if (!summary) return "No especificado";
  if (summary.paymentMethod) return summary.paymentMethod;
  return getPackDescription(summary.pack);
};

const getFeaturedDescription = (featured) => {
  if (featured === undefined || featured === null) return "No especificado";
  if (featured === "free") return "Usar uno de mis destacados gratuitos";
  if (featured === false) return "Anuncio sin destacar";
  if (featured === true) return "Destacar mi anuncio por $10.000";
  return "No especificado";
};

const getFormattedPrice = (price, currency = "CLP") => {
  if (!price && price !== 0) return "No especificado";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency,
  }).format(price || 0);
};

const getTotalDescription = (summary) => {
  if (!summary) return "No especificado";
  if (!summary.hasToPay || !summary.totalAmount) return "Sin pago";
  return getFormattedPrice(summary.totalAmount, "CLP");
};

const getFullAddress = (address, number) => {
  if (!address && !number) return "No especificada";
  return `${address}, ${number}`.trim();
};

const getDimensions = (summary) => {
  if (!summary.width && !summary.height && !summary.depth)
    return "No especificadas";
  return `${summary.width} x ${summary.height} x ${summary.depth} (m)`;
};

// Método para obtener la URL completa de la imagen
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  return transformUrl(imageUrl);
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
