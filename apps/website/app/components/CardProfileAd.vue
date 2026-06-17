<template>
  <article class="card card--profileAd">
    <!-- Thumbnail tile: background bound from category color (data-driven, not static design) -->
    <span
      class="card--profileAd__thumb"
      :style="{ background: categoryColor }"
    >
      <component :is="categoryIcon" :size="30" class="card--profileAd__thumb__icon" />
      <span class="card--profileAd__thumb__count">{{ photoCount }} {{ photoCount === 1 ? 'foto' : 'fotos' }}</span>
    </span>

    <!-- Body -->
    <div class="card--profileAd__body">
      <!-- Title row -->
      <div class="card--profileAd__body__top">
        <span class="card--profileAd__body__title">{{ ad?.title ?? ad?.name }}</span>
        <span :class="['card--profileAd__body__badge', `card--profileAd__body__badge--${badgeVariant}`]">
          {{ badgeLabel }}
        </span>
        <span v-if="ad?.featured" class="card--profileAd__body__featured">
          <Star :size="11" />
          Destacado
        </span>
      </div>

      <!-- Meta row -->
      <div class="card--profileAd__body__meta">
        <span class="card--profileAd__body__meta__cat">
          <span class="card--profileAd__body__meta__cat__dot" :style="{ background: categoryColor }" />
          {{ categoryName }}
        </span>
        <span class="card--profileAd__body__meta__date">
          <Calendar :size="14" />
          {{ formatDate(ad?.createdAt) }}
        </span>
        <span class="card--profileAd__body__meta__right">{{ metaRight }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="card--profileAd__actions">
      <!-- Published: primary = Destacar (amber) when not featured; Estadísticas (secondary) when featured; overflow menu -->
      <template v-if="ad?.status === 'published'">
        <!-- Not featured: primary CTA is Destacar → /packs -->
        <nuxt-link
          v-if="!ad?.featured"
          to="/packs"
          class="card--profileAd__actions__primary"
        >
          <Star :size="15" />
          Destacar
        </nuxt-link>
        <!-- Featured: primary CTA is Estadísticas (secondary style) -->
        <button
          v-else
          type="button"
          class="card--profileAd__actions__secondary"
          @click="handleOpenStats()"
        >
          <ChartNoAxesColumn :size="15" />
          Estadísticas
        </button>

        <div class="card--profileAd__actions__overflow">
          <button
            type="button"
            class="card--profileAd__actions__menu-btn"
            :aria-expanded="menuOpen"
            title="Más opciones"
            @click="toggleMenu()"
          >
            <EllipsisVertical :size="18" />
          </button>
          <template v-if="menuOpen">
            <span class="card--profileAd__actions__backdrop" @click="toggleMenu()" />
            <div class="card--profileAd__actions__dropdown">
              <!-- Estadísticas only in menu when not featured (otherwise it's primary) -->
              <button
                v-if="!ad?.featured"
                type="button"
                class="card--profileAd__actions__dropdown__item"
                @click="handleOpenStats(); toggleMenu()"
              >
                <ChartNoAxesColumn :size="16" />
                Estadísticas
              </button>
              <!-- Ver anuncio — only when slug is available -->
              <nuxt-link
                v-if="ad?.slug"
                :to="`/anuncios/${ad.slug}`"
                class="card--profileAd__actions__dropdown__item"
                target="_blank"
                rel="noopener noreferrer"
                @click="toggleMenu()"
              >
                <Eye :size="16" />
                Ver anuncio
              </nuxt-link>
              <button
                type="button"
                class="card--profileAd__actions__dropdown__item"
                @click="handleMarkSold(); toggleMenu()"
              >
                <CircleCheck :size="16" />
                Marcar como vendido
              </button>
              <button
                type="button"
                class="card--profileAd__actions__dropdown__item card--profileAd__actions__dropdown__item--danger"
                @click="handleDeactivate(); toggleMenu()"
              >
                <CircleOff :size="16" />
                Dar de baja
              </button>
            </div>
          </template>
        </div>
      </template>

      <!-- Review: preview link -->
      <nuxt-link
        v-else-if="ad?.status === 'review' && ad?.slug"
        :to="`/anuncios/${ad.slug}`"
        class="card--profileAd__actions__secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Eye :size="15" />
        Previsualizar
      </nuxt-link>

      <!-- Expired: Republicar -->
      <button
        v-else-if="ad?.status === 'expired'"
        type="button"
        class="card--profileAd__actions__primary"
        @click="handleRepublish()"
      >
        <RefreshCw :size="15" />
        Republicar
      </button>

      <!-- Rejected: Ver motivo -->
      <button
        v-else-if="ad?.status === 'rejected'"
        type="button"
        class="card--profileAd__actions__secondary"
        @click="handleRejectedClick()"
      >
        <CircleAlert :size="15" />
        Ver motivo
      </button>

      <!-- Banned: Ver motivo -->
      <button
        v-else-if="ad?.status === 'banned'"
        type="button"
        class="card--profileAd__actions__secondary"
        @click="handleBannedClick()"
      >
        <CircleAlert :size="15" />
        Ver motivo
      </button>
    </div>
  </article>

  <StatsAdModal
    :open="statsOpen"
    :ad="statsModalAd"
    @close="statsOpen = false"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import {
  Star,
  Eye,
  RefreshCw,
  CircleAlert,
  Calendar,
  EllipsisVertical,
  ChartNoAxesColumn,
  CircleCheck,
  CircleOff,
} from "lucide-vue-next";
import StatsAdModal from "@/components/StatsAdModal.vue";
const { Swal } = useSweetAlert2();
import { useAdStore } from "@/stores/ad.store";
import { useCommunesStore } from "@/stores/communes.store";
import { useAppStore } from "@/stores/app.store";
import type { GalleryItem } from "@/types/ad";
import type { Category } from "@/types/category";
import { useImageProxy } from "@/composables/useImage";

const { transformUrl } = useImageProxy();
const { getCategoryIcon } = useIcons();

const FALLBACK_COLOR = "#ece9e4";

const props = defineProps({
  ad: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const menuOpen = ref(false);
const toggleMenu = () => { menuOpen.value = !menuOpen.value; };

// Stats modal
const statsOpen = ref(false);
const statsModalAd = computed(() => {
  if (!props.ad?.documentId) return null;
  return {
    documentId: props.ad.documentId as string,
    name: (props.ad.title ?? props.ad.name ?? "") as string,
    category: categoryName.value || undefined,
    status: props.ad.status as string | undefined,
  };
});

const handleOpenStats = () => {
  statsOpen.value = true;
};

const adCategory = computed<Category | null>(() =>
  typeof props.ad?.category === "object" && props.ad?.category !== null
    ? (props.ad.category as Category)
    : null,
);
const categoryColor = computed(() => adCategory.value?.color ?? FALLBACK_COLOR);
const categoryIcon = computed(() => getCategoryIcon(adCategory.value?.slug ?? ""));
const categoryName = computed(() => adCategory.value?.name ?? "");

const photoCount = computed(() => (props.ad?.gallery as GalleryItem[] | undefined)?.length ?? 0);

// Badge
const badgeVariant = computed(() => {
  const s = props.ad?.status;
  if (s === "published") {
    if ((props.ad?.remaining_days as number) <= 7) return "expiring";
    return "active";
  }
  if (s === "review") return "review";
  if (s === "expired") return "expired";
  if (s === "rejected") return "rejected";
  if (s === "banned") return "banned";
  return "expired";
});

const badgeLabel = computed(() => {
  const s = props.ad?.status;
  const days = props.ad?.remaining_days as number;
  if (s === "published") {
    if (days <= 7) return `Vence en ${days} días`;
    return "Activo";
  }
  if (s === "review") return "En revisión";
  if (s === "expired") return "Expirado";
  if (s === "rejected") return "Rechazado";
  if (s === "banned") return "Baneado";
  return "";
});

// Per-card stats (lazy, only for published)
const adViews = ref(0);
const adContacts = ref(0);

onMounted(() => {
  if (import.meta.client && props.ad?.status === "published" && props.ad?.documentId) {
    const userStore = useUserStore();
    userStore.loadAdStats(props.ad.documentId as string).then((res) => {
      adViews.value = res.total;
      adContacts.value = res.contacts;
    });
  }
});

const statusMessage = computed(() => {
  const status = props.ad?.status;
  const days = props.ad?.remaining_days as number;
  const createdAt = props.ad?.createdAt ? new Date(props.ad.createdAt as string).getTime() : 0;
  const now = Date.now();
  const hoursDiff = Math.floor((now - createdAt) / (1000 * 60 * 60));
  const daysDiff = Math.floor(hoursDiff / 24);

  if (!status) return "";

  switch (status) {
    case "published":
      if (days === 1) return "Expira en 1 día";
      return `Expira en ${days} días`;
    case "review":
      if (hoursDiff < 24) {
        if (hoursDiff === 0) return "En revisión hace menos de 1 hora";
        if (hoursDiff === 1) return "En revisión hace 1 hora";
        return `En revisión hace ${hoursDiff} horas`;
      }
      if (daysDiff === 1) return "En revisión hace 1 día";
      return `En revisión hace ${daysDiff} días`;
    case "expired":
      if (daysDiff === 1) return "Expirado hace 1 día";
      return `Expirado hace ${daysDiff} días`;
    case "rejected":
      if (daysDiff === 1) return "Rechazado hace 1 día";
      return `Rechazado hace ${daysDiff} días`;
    case "banned":
      if (daysDiff === 1) return "Baneado hace 1 día";
      return daysDiff > 0 ? `Baneado hace ${daysDiff} días` : "Baneado";
    default:
      return "";
  }
});

const metaRight = computed(() => {
  if (props.ad?.status === "published") {
    return `${adViews.value} vistas · ${adContacts.value} contactos`;
  }
  return statusMessage.value;
});

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()}`;
};

const handleRepublish = async () => {
  const ad = props.ad;
  const adStore = useAdStore();
  const communesStore = useCommunesStore();

  const fillAdStore = async () => {
    if (!ad) return;
    adStore.reset();
    adStore.updatePrice(Number(ad.price));
    adStore.updateName(ad.name);
    adStore.updateCategory(ad.category.id);
    adStore.updateEmail(ad.email);
    adStore.updatePhone(ad.phone);
    if (communesStore.getCommunes.data.length === 0) {
      await communesStore.loadCommunes();
    }
    const regionId = communesStore.getCommuneById(ad.commune.id)?.region.id;
    if (regionId) {
      adStore.updateRegion(regionId);
    }
    adStore.updateCommune(ad.commune.id);
    adStore.updateAddress(ad.address);
    adStore.updateAddressNumber(ad.address_number);
    adStore.updateCondition(ad.condition.id);
    adStore.updateDescription(ad.description);
    adStore.updateManufacturer(ad.manufacturer);
    adStore.updateModel(ad.model);
    adStore.updateYear(Number(ad.year));
    adStore.updateSerialNumber(ad.serial_number);
    adStore.updateWeight(Number(ad.weight));
    adStore.updateWidth(Number(ad.width));
    adStore.updateHeight(Number(ad.height));
    adStore.updateDepth(Number(ad.depth));
    adStore.updateCurrency(ad.currency);
    const updatedGallery: GalleryItem[] = (ad.gallery as Array<{ id: number; url: string }>).map(
      (img) => ({
        id: String(img.id),
        url: transformUrl(img.url),
      }),
    );
    adStore.updateGallery(updatedGallery);
    if (ad.details) {
      adStore.updatePack(ad.details.pack);
      adStore.updateFeatured(ad.details.featured);
      adStore.updateIsInvoice(ad.details.is_invoice);
    }
    adStore.updateStep(1);
    navigateTo("/anunciar");
  };

  if (adStore.hasFormInProgress) {
    Swal.fire({
      title: "Formulario en progreso",
      text: "Hay un formulario de anuncio sin terminar. ¿Deseas descartarlo y comenzar uno nuevo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, descartar",
      cancelButtonText: "No, mantener el actual",
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        fillAdStore();
      }
    });
  } else {
    await fillAdStore();
  }
};

const handleRejectedClick = () => {
  Swal.fire({
    title: "Razón del rechazo",
    text: props.ad?.reason_for_rejection || "No se especificó una razón",
    icon: "info",
    confirmButtonText: "Entendido",
  });
};

const handleBannedClick = () => {
  Swal.fire({
    title: "Razón del baneo",
    text: props.ad?.reason_for_ban || "No se especificó una razón",
    icon: "info",
    confirmButtonText: "Entendido",
  });
};

const handleMarkSold = () => {
  Swal.fire({
    title: "Marcar como vendido",
    text: "Esta función aún no está disponible. Si ya vendiste este artículo, puedes usar \"Dar de baja\" para retirarlo de la plataforma.",
    icon: "info",
    confirmButtonText: "Entendido",
  });
};

const handleDeactivate = () => {
  const appStore = useAppStore();
  appStore.openDeactivateLightbox(props.ad.documentId as string);
};

</script>
