<template>
  <section class="announcement announcement--single">
    <div class="announcement--single__container">
      <div class="announcement--single__body">
        <div class="announcement--single__body__gallery">
          <GalleryDefault
            :media="all?.gallery || null"
            :condition="getCondition?.name || ''"
            :name="all?.name"
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
              <span
                class="announcement--single__body__specs__grid__item__label"
              >
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
              <span
                class="announcement--single__body__specs__grid__item__label"
              >
                Región
              </span>
              <span
                class="announcement--single__body__specs__grid__item__value"
              >
                {{ regionName }}
              </span>
            </div>
            <div class="announcement--single__body__specs__grid__item">
              <span
                class="announcement--single__body__specs__grid__item__label"
              >
                Comuna
              </span>
              <span
                class="announcement--single__body__specs__grid__item__value"
              >
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
              <span
                class="announcement--single__body__specs__grid__item__label"
              >
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

        <div class="announcement--single__sidebar__price">
          <span class="announcement--single__sidebar__price__label"
            >Precio</span
          >
          <div class="announcement--single__sidebar__price__amount">
            <span class="announcement--single__sidebar__price__amount__value">
              {{ all?.priceData?.formattedPrice }}
            </span>
            <span class="announcement--single__sidebar__price__amount__iva">
              + IVA
            </span>
          </div>
          <span
            v-if="all?.priceData?.convertedPrice"
            class="announcement--single__sidebar__price__converted"
          >
            <span
              v-tooltip="{
                content: `Valor del dólar hoy ${formatShortDate(
                  all?.priceData.convertedTimestamp,
                )}: ${usdExchangeRate}`,
                placement: 'top',
              }"
              class="announcement--single__sidebar__price__converted__tip"
            >
              <InfoIcon :size="15" />
            </span>
            {{ all?.priceData.formattedConvertedPrice }}
          </span>
        </div>

        <div class="announcement--single__sidebar__contact">
          <template v-if="getUserFromAll && isLoggedIn">
            <nuxt-link
              :to="`/${getUserFromAll?.username}`"
              class="announcement--single__sidebar__contact__seller"
            >
              <div class="announcement--single__sidebar__contact__seller__head">
                <span
                  class="announcement--single__sidebar__contact__seller__avatar"
                >
                  {{ sellerInitials }}
                </span>
                <div
                  class="announcement--single__sidebar__contact__seller__info"
                >
                  <div
                    class="announcement--single__sidebar__contact__seller__info__name"
                  >
                    <span>{{ getUserFullName }}</span>
                    <span
                      v-if="isPro"
                      class="announcement--single__sidebar__contact__seller__info__pro"
                    >
                      <Star :size="10" />
                      PRO
                    </span>
                  </div>
                  <div
                    class="announcement--single__sidebar__contact__seller__info__chips"
                  >
                    <span
                      v-if="isVerified"
                      class="announcement--single__sidebar__contact__seller__info__verified"
                    >
                      <Check :size="12" />
                      Verificado
                    </span>
                    <span
                      v-else
                      class="announcement--single__sidebar__contact__seller__info__unverified"
                    >
                      Sin verificar
                    </span>
                  </div>
                </div>
              </div>
              <span
                class="announcement--single__sidebar__contact__seller__link"
              >
                Ver perfil y todos sus avisos
                <ArrowRight :size="13" />
              </span>
            </nuxt-link>

            <div class="announcement--single__sidebar__contact__divider" />

            <div
              v-if="hasEmail"
              class="announcement--single__sidebar__contact__row"
            >
              <div class="announcement--single__sidebar__contact__row__data">
                <span
                  class="announcement--single__sidebar__contact__row__data__label"
                >
                  Email
                </span>
                <span
                  v-if="emailRevealed"
                  class="announcement--single__sidebar__contact__row__data__real"
                >
                  {{ emailReal }}
                </span>
                <span
                  v-else
                  class="announcement--single__sidebar__contact__row__data__masked"
                >
                  {{ getUserFromAll.email }}
                </span>
              </div>
              <button
                class="announcement--single__sidebar__contact__row__reveal"
                title="Mostrar y copiar email"
                @click="revealChannel('email')"
              >
                <Loader2
                  v-if="emailLoading"
                  class="announcement--single__sidebar__contact__row__reveal__spin"
                  :size="16"
                />
                <Check
                  v-else-if="emailCopied"
                  class="announcement--single__sidebar__contact__row__reveal__check"
                  :size="16"
                />
                <Copy v-else-if="emailRevealed" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>

            <div
              v-if="hasEmail && hasPhone"
              class="announcement--single__sidebar__contact__divider announcement--single__sidebar__contact__divider--tight"
            />

            <div
              v-if="hasPhone"
              class="announcement--single__sidebar__contact__row"
            >
              <div class="announcement--single__sidebar__contact__row__data">
                <span
                  class="announcement--single__sidebar__contact__row__data__label"
                >
                  Teléfono
                </span>
                <span
                  v-if="phoneRevealed"
                  class="announcement--single__sidebar__contact__row__data__real"
                >
                  {{ phoneReal }}
                </span>
                <span
                  v-else
                  class="announcement--single__sidebar__contact__row__data__masked"
                >
                  {{ getUserFromAll.phone }}
                </span>
              </div>
              <button
                class="announcement--single__sidebar__contact__row__reveal"
                title="Mostrar y copiar teléfono"
                @click="revealChannel('phone')"
              >
                <Loader2
                  v-if="phoneLoading"
                  class="announcement--single__sidebar__contact__row__reveal__spin"
                  :size="16"
                />
                <Check
                  v-else-if="phoneCopied"
                  class="announcement--single__sidebar__contact__row__reveal__check"
                  :size="16"
                />
                <Copy v-else-if="phoneRevealed" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>

            <div
              v-if="hasEmail || hasPhone"
              class="announcement--single__sidebar__contact__note"
            >
              <Lock :size="13" />
              <span>
                Datos protegidos contra robots · se revelan al copiarlos o al
                contactar.
              </span>
            </div>

            <button
              v-if="hasWhatsapp"
              class="announcement--single__sidebar__contact__whatsapp"
              @click="openWhatsapp"
            >
              <Loader2
                v-if="whatsappLoading"
                class="announcement--single__sidebar__contact__whatsapp__spin"
                :size="18"
              />
              <IconWhatsApp v-else />
              Escribir por WhatsApp
            </button>

            <button
              v-if="hasPhone"
              class="announcement--single__sidebar__contact__call"
              @click="openCall"
            >
              <Loader2
                v-if="callLoading"
                class="announcement--single__sidebar__contact__call__spin"
                :size="17"
              />
              <Phone v-else :size="17" />
              Llamar ahora
            </button>
          </template>

          <div v-else class="announcement--single__sidebar__contact__reminder">
            <ReminderDefault :verified="isVerified" />
          </div>
        </div>

        <div class="announcement--single__sidebar__share">
          <ShareDefault :title="all?.name" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import ReminderDefault from "@/components/ReminderDefault";
import GalleryDefault from "@/components/GalleryDefault";
import {
  Info as InfoIcon,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Eye,
  Copy,
  Check,
  Loader2,
  Lock,
  Phone,
} from "lucide-vue-next";
import IconWhatsApp from "@/components/icons/IconWhatsApp.vue";
import ShareDefault from "@/components/ShareDefault";
import MemoDefault from "@/components/MemoDefault";
import { useSanitize } from "@/composables/useSanitize";

const DAYS_LEFT_WARNING = 3;
const COPIED_RESET_MS = 1500;

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

// Per-channel reveal state. The payload only carries OBFUSCATED email/phone
// (08-04); the real values arrive on demand from the matching reveal endpoint.
const emailRevealed = ref(false);
const emailReal = ref("");
const emailLoading = ref(false);
const emailCopied = ref(false);

const phoneRevealed = ref(false);
const phoneReal = ref("");
const phoneLoading = ref(false);
const phoneCopied = ref(false);

const whatsappLoading = ref(false);
const callLoading = ref(false);

// Render gating: the seller may be a manager (bypasses masking → no has_*
// flags but real value present), or a regular user (masked value + has_* flag).
// has_X || X covers both without excluding managers.
const hasEmail = computed(() => {
  const u = getUserFromAll.value;
  return !!(u?.has_email || u?.email);
});
const hasPhone = computed(() => {
  const u = getUserFromAll.value;
  return !!(u?.has_phone || u?.phone);
});
const hasWhatsapp = computed(() => {
  const u = getUserFromAll.value;
  return !!(u?.has_whatsapp || u?.whatsapp);
});

const isPro = computed(() => getUserFromAll.value?.pro_status === "active");
const isVerified = computed(() => getUserFromAll.value?.verified === true);

const sellerInitials = computed(() => {
  const u = getUserFromAll.value;
  if (!u) return "";
  const first = (u.firstname || "").charAt(0);
  const last = (u.lastname || "").charAt(0);
  return (
    `${first}${last}`.toUpperCase() ||
    (u.username || "").charAt(0).toUpperCase()
  );
});

// Extract the real value from a 08-04 reveal endpoint response. Each call site
// builds its own per-channel path so the three channels stay explicit. The
// reveal endpoint records the ad-contact server-side, so the old client-side
// recording call is intentionally gone (no double-count); GA4 contactSeller
// still fires on every click for analytics parity.
const extractReveal = (response) => {
  const value = response?.data?.value;
  return typeof value === "string" ? value : "";
};

const revealEmail = async () => {
  if (emailLoading.value) return;
  const documentId = props.all?.documentId;
  if (!documentId) return;
  contactSeller("email");
  emailLoading.value = true;
  try {
    const value = extractReveal(
      await apiClient(`ads/${documentId}/reveal/email`),
    );
    if (value) {
      emailReal.value = value;
      emailRevealed.value = true;
      await copyValue(value, emailCopied);
    }
  } catch {
    /* swallow — reveal must never break the page */
  } finally {
    emailLoading.value = false;
  }
};

const revealPhone = async () => {
  if (phoneLoading.value) return;
  const documentId = props.all?.documentId;
  if (!documentId) return;
  contactSeller("phone");
  phoneLoading.value = true;
  try {
    const value = extractReveal(
      await apiClient(`ads/${documentId}/reveal/phone`),
    );
    if (value) {
      phoneReal.value = value;
      phoneRevealed.value = true;
      await copyValue(value, phoneCopied);
    }
  } catch {
    /* swallow — reveal must never break the page */
  } finally {
    phoneLoading.value = false;
  }
};

const revealChannel = (channel) =>
  channel === "email" ? revealEmail() : revealPhone();

const copyValue = async (value, copiedRef) => {
  try {
    await navigator.clipboard.writeText(value);
    copiedRef.value = true;
    setTimeout(() => {
      copiedRef.value = false;
    }, COPIED_RESET_MS);
  } catch {
    /* clipboard unavailable — value is still revealed */
  }
};

const openWhatsapp = async () => {
  if (whatsappLoading.value) return;
  const documentId = props.all?.documentId;
  if (!documentId) return;
  contactSeller("whatsapp");
  whatsappLoading.value = true;
  try {
    const value = extractReveal(
      await apiClient(`ads/${documentId}/reveal/whatsapp`),
    );
    const digits = (value || "").replace(/\D/g, "");
    if (digits) {
      window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
    }
  } catch {
    /* swallow */
  } finally {
    whatsappLoading.value = false;
  }
};

const openCall = async () => {
  if (callLoading.value) return;
  contactSeller("phone");
  // Reuse an already-revealed phone value instead of refetching.
  if (phoneReal.value) {
    window.location.href = `tel:${phoneReal.value}`;
    return;
  }
  const documentId = props.all?.documentId;
  if (!documentId) return;
  callLoading.value = true;
  try {
    const value = extractReveal(
      await apiClient(`ads/${documentId}/reveal/phone`),
    );
    if (value) {
      phoneReal.value = value;
      phoneRevealed.value = true;
      window.location.href = `tel:${value}`;
    }
  } catch {
    /* swallow */
  } finally {
    callLoading.value = false;
  }
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
