<template>
  <section class="announcement announcement--single">
    <div class="announcement--single__container">
      <div class="announcement--single__body">
        <div class="announcement--single__body__gallery">
          <GalleryDefault
            :media="all?.gallery || null"
            :condition="getCondition?.name || ''"
          />
        </div>

        <div class="announcement--single__body__description">
          <h2 class="announcement--single__body__description__title">
            Acerca de este producto
          </h2>
          <div
            class="announcement--single__body__description__text"
            v-html="sanitizeRich(all.description)"
          />
        </div>

        <div class="announcement--single__body__specs">
          <h2 class="announcement--single__body__specs__title">Ubicación</h2>
          <div class="announcement--single__body__specs__grid">
            <div class="announcement--single__body__specs__grid__item">
              <span class="announcement--single__body__specs__grid__item__label">
                Dirección
              </span>
              <a
                v-if="fullAddress"
                class="announcement--single__body__specs__grid__item__link"
                :href="googleMapsUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin
                  class="announcement--single__body__specs__grid__item__link__icon"
                  :size="15"
                />
                {{ fullAddress }}
              </a>
              <span
                v-else
                class="announcement--single__body__specs__grid__item__empty"
              >
                No especificado
              </span>
            </div>
            <div class="announcement--single__body__specs__grid__item">
              <span class="announcement--single__body__specs__grid__item__label">
                Región
              </span>
              <span class="announcement--single__body__specs__grid__item__value">
                {{ regionName }}
              </span>
            </div>
            <div class="announcement--single__body__specs__grid__item">
              <span class="announcement--single__body__specs__grid__item__label">
                Comuna
              </span>
              <span class="announcement--single__body__specs__grid__item__value">
                {{ communeName }}
              </span>
            </div>
          </div>
        </div>

        <div class="announcement--single__body__specs">
          <h2 class="announcement--single__body__specs__title">
            Especificación técnica
          </h2>
          <div class="announcement--single__body__specs__grid">
            <div
              v-for="spec in technicalSpecs"
              :key="spec.label"
              class="announcement--single__body__specs__grid__item"
            >
              <span class="announcement--single__body__specs__grid__item__label">
                {{ spec.label }}
              </span>
              <span
                v-if="spec.value"
                class="announcement--single__body__specs__grid__item__value"
              >
                {{ spec.value }}
              </span>
              <span
                v-else
                class="announcement--single__body__specs__grid__item__empty"
              >
                No especificado
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="announcement--single__sidebar">
        <div
          v-if="
            !all.active ||
            (all.active && all.remaining_days <= DAYS_LEFT_WARNING)
          "
          class="announcement--single__sidebar__expired"
        >
          <MemoDefault
            v-if="!all.active && access?.message"
            :icon="Clock"
            :text="access.message"
            link=""
          />
          <MemoDefault
            v-if="all.active && all.remaining_days <= DAYS_LEFT_WARNING"
            :icon="Clock"
            :text="`Este anuncio expira en ${all.remaining_days} días.`"
            link=""
          />
        </div>

        <div class="announcement--single__sidebar__info">
          <div class="announcement--single__sidebar__info__top">
            <span class="announcement--single__sidebar__info__top__title" sub>
              Precio
            </span>
            <span class="announcement--single__sidebar__info__top__price">
              {{ all?.priceData.formattedPrice }}
              <div
                v-if="all?.priceData.convertedPrice"
                class="announcement--single__sidebar__info__top__price__converted"
              >
                <span
                  v-tooltip="{
                    content: `Valor del dólar hoy ${formatShortDate(
                      all?.priceData.convertedTimestamp,
                    )}: ${usdExchangeRate}`,
                    placement: 'top',
                  }"
                >
                  <InfoIcon class="icon" size="16" />
                </span>
                {{ all?.priceData.formattedConvertedPrice }}
              </div>
            </span>
          </div>
          <div
            v-if="getUserFromAll && isLoggedIn"
            class="announcement--single__sidebar__info__seller"
          >
            <CardInfo title="Contacto" :description="getUserFullName" />
            <div
              v-if="getUserFromAll?.email"
              @click.capture="handleContact('email')"
            >
              <CardInfo
                title="Email"
                :description="getUserFromAll.email"
                show-copy-button
              />
            </div>
            <div
              v-if="getUserFromAll?.phone"
              @click.capture="handleContact('phone')"
            >
              <CardInfo
                title="Teléfono"
                :description="getUserFromAll.phone"
                show-copy-button
              />
            </div>
          </div>
          <div v-else class="announcement--single__sidebar__info__reminder">
            <ReminderDefault />
          </div>
        </div>

        <div class="announcement--single__sidebar__share">
          <ShareDefault />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import ReminderDefault from "@/components/ReminderDefault";
import GalleryDefault from "@/components/GalleryDefault";
import CardInfo from "@/components/CardInfo";
import { Info as InfoIcon, Clock, MapPin } from "lucide-vue-next";
import ShareDefault from "@/components/ShareDefault";
import MemoDefault from "@/components/MemoDefault";
import { useSanitize } from "@/composables/useSanitize";

const DAYS_LEFT_WARNING = 3;

const props = defineProps({
  all: {
    type: Object,
    default: () => ({}),
  },
  access: {
    type: Object,
    default: null,
  },
});

// Usuario autenticado
const authUser = useSessionUser();
const isLoggedIn = computed(() => !!authUser.value);

// Composable para sanitización
const { sanitizeRich } = useSanitize();

const { contactSeller } = useAdAnalytics();
const apiClient = useApiClient();

// Fires the GA4 analytics event (existing behavior) and records an in-app
// ad-contact event so "Contactos recibidos" reflects real data. The contact
// recording is non-fatal — it must never break the contact action.
const handleContact = (type) => {
  contactSeller(type);
  const documentId = props.all?.documentId;
  if (!documentId) return;
  apiClient(`ads/${documentId}/contact`, {
    method: "POST",
    body: { type: type === "phone" ? "call" : "message" },
  }).catch(() => {
    /* swallow — contact tracking must never break the page */
  });
};

// Computed property para obtener el nombre de la comuna
const communeName = computed(() => {
  return props.all?.commune?.name || "--";
});

const regionName = computed(() => {
  return props.all?.commune?.region?.name || "--";
});

const getUserFromAll = computed(() => {
  return props.all?.user || null;
});

const getCondition = computed(() => {
  return props.all?.condition || null;
});

// Computed property para obtener las medidas
const getDimensions = computed(() => {
  const { width, height, depth } = props.all;
  if (!width && !height && !depth) return "";
  return `${width}m x ${height}m x ${depth}m`;
});

const getWeight = computed(() => {
  return props.all.weight ? `${props.all.weight}kg` : "";
});

// Flat label/value list rendered by the mockup's 2-col Especificación grid.
// An empty value renders the "No especificado" italic state.
const technicalSpecs = computed(() => [
  { label: "Año", value: props.all?.year ? String(props.all.year) : "" },
  { label: "Manufactura", value: props.all?.manufacturer || "" },
  { label: "Modelo", value: props.all?.model || "" },
  { label: "Número de serie", value: props.all?.serial_number || "" },
  { label: "Medidas (Ancho x Alto x Profundidad)", value: getDimensions.value },
  { label: "Peso", value: getWeight.value },
  { label: "Condición", value: getCondition.value?.name || "" },
]);

const fullAddress = computed(() => {
  const { address, address_number } = props.all;
  if (!address || !address_number) return "";

  return `${address}, #${address_number}`;
});

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString("es-CL", { month: "long" });
  return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}`;
};

const usdExchangeRate = computed(() => {
  const priceData = props.all?.priceData;
  if (!priceData?.convertedPrice || !priceData?.originalPrice) return "";
  const rate =
    priceData.originalCurrency === "USD"
      ? priceData.convertedPrice / priceData.originalPrice
      : priceData.originalPrice / priceData.convertedPrice;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(rate));
});

const getUserFullName = computed(() => {
  const user = getUserFromAll.value;
  if (!user) return "";
  return `${user.firstname || ""} ${user.lastname || ""}`.trim();
});

const googleMapsUrl = computed(() => {
  if (!fullAddress.value) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress.value + ", " + communeName.value + ", " + regionName.value,
  )}`;
});
</script>
