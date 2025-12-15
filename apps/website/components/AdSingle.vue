<template>
  <section class="announcement announcement--single">
    <div class="announcement--single__container">
      <!-- <pre>{{ all }}</pre> -->
      <div class="announcement--single__body">
        <div class="announcement--single__body__gallery">
          <GalleryDefault :media="all?.gallery || null" />
        </div>

        <div class="announcement--single__body__description">
          <h3 class="announcement--single__body__description__title subtitle">
            Acerca de este producto
          </h3>
          <div
            class="announcement--single__body__description__text"
            v-html="sanitizeRich(all.description)"
          />
        </div>

        <div class="announcement--single__body__specs">
          <h3 class="announcement--single__body__specs__title subtitle">
            Ubicación
          </h3>
          <div class="announcement--single__body__specs__table">
            <CardInfo
              :title="`Dirección`"
              :description="fullAddress"
              :link="googleMapsUrl"
              :info="`Ver en Google Maps`"
            />
            <CardInfo :title="`Región`" :description="regionName" />
            <CardInfo :title="`Comuna`" :description="communeName" />
          </div>
        </div>

        <div class="announcement--single__body__specs">
          <h3 class="announcement--single__body__specs__title subtitle">
            Especificación técnica
          </h3>
          <div class="announcement--single__body__specs__table">
            <CardInfo :title="`Año`" :description="all.year" />
            <CardInfo :title="`Manufactura`" :description="all.manufacturer" />
            <CardInfo :title="`Modelo`" :description="all.model" />
            <CardInfo
              :title="`Número de serie`"
              :description="all.serial_number"
            />
            <CardInfo
              :title="`Medidas (Ancho x Alto x Profundidad)`"
              :description="getDimensions"
            />
            <CardInfo :title="`Peso`" :description="getWeight" />
            <CardInfo :title="`Condición`" :description="getCondition?.name" />
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
          <!-- Mensaje de revisión -->
          <MemoDefault
            v-if="!all.active"
            :icon="Clock"
            text="Este anuncio está en revisión. Solo tú puedes verlo."
            link=""
          />

          <!-- Mensaje de expiración -->
          <MemoDefault
            v-if="all.active && all.remaining_days <= DAYS_LEFT_WARNING"
            :icon="Clock"
            :text="`Este anuncio expira en ${all.remaining_days} días.`"
            link=""
          />
        </div>

        <div class="announcement--single__sidebar__info">
          <!-- price  -->
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
                    content: `Valor del dólar al ${formatDate(
                      all?.priceData.convertedTimestamp,
                    )}`,
                    placement: 'top',
                  }"
                >
                  <InfoIcon class="icon" size="16" />
                </span>
                {{ all?.priceData.formattedConvertedPrice }}
              </div>
            </span>
          </div>

          <!-- seller contact -->
          <div v-if="user" class="announcement--single__sidebar__info__seller">
            <CardInfo title="Contacto" :description="getUserFullName" />
            <CardInfo
              title="Email"
              :description="getUserFromAll.email"
              show-copy-button
            />
            <CardInfo
              title="Teléfono"
              :description="getUserFromAll.phone"
              show-copy-button
            />
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
import { Info as InfoIcon, Clock } from "lucide-vue-next";
import ShareDefault from "@/components/ShareDefault";
import MemoDefault from "@/components/MemoDefault";
import { useSanitize } from "@/composables/useSanitize";

const DAYS_LEFT_WARNING = 3;

const props = defineProps({
  all: {
    type: Object,
    default: () => ({}),
  },
});

const user = useStrapiUser();

// Composable para sanitización
const { sanitizeRich } = useSanitize();

// Computed property para obtener el nombre de la comuna
const communeName = computed(() => {
  return props.all.commune.name;
});

const regionName = computed(() => {
  return props.all.commune.region.name;
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
  return `${width}m x ${height}m x ${depth}m`;
});

const getWeight = computed(() => {
  return props.all.weight ? `${props.all.weight}kg` : "N/A";
});

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
