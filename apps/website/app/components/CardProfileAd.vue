<template>
  <article class="card card--profileAd">
    <!-- <pre>{{ ad?.status }}</pre> -->
    <!-- <pre>{{ firstSmallImageUrl }}</pre> -->

    <div class="card--profileAd__left">
      <div class="card--profileAd__images">
        <template v-for="index in 5" :key="index">
          <div
            v-if="!lastFiveImages[4 - (index - 1)]"
            class="card--profileAd__images__placeholder"
          ></div>
          <NuxtImg
            v-else
            class="card--profileAd__images__img"
            loading="lazy"
            :src="lastFiveImages[4 - (index - 1)]"
            :alt="ad?.title"
            :title="ad?.title"
            remote
          />
        </template>
      </div>

      <div class="card--profileAd__info">
        <div class="card--profileAd__info__title">
          {{ formatDate(ad?.createdAt) }}
        </div>
        <div class="card--profileAd__info__text">
          {{ ad?.name }}
        </div>
      </div>

      <div class="card--profileAd__highlight">
        <div
          v-if="ad?.details?.featured"
          class="card--profileAd__highlight__title"
        >
          <IconStar :size="16" />
          Anuncio destacado
        </div>

        <div class="card--profileAd__highlight__text">
          {{ statusMessage }}
          <!-- <small style="color: #666; font-size: 0.8em;">(Estado: {{ ad?.status }})</small> -->
        </div>
      </div>
    </div>

    <div class="card--profileAd__right">
      <div class="card--profileAd__button">
        <!-- Botones para publicados -->
        <template v-if="ad?.status === 'published' && ad?.slug">
          <ButtonIcon
            :icon="IconEye"
            :to="`/anuncios/${ad?.slug}`"
            title="Ver anuncio"
            aria-label="Ver anuncio"
            target="_blank"
            rel="noopener noreferrer"
          />
          <ButtonIcon
            :icon="IconPower"
            title="Desactivar publicación"
            aria-label="Desactivar publicación"
            @click="handleDeactivate"
          />
        </template>

        <!-- Botón para en revisión -->
        <ButtonIcon
          v-if="ad?.status === 'review' && ad?.slug"
          :icon="IconEye"
          :to="`/anuncios/${ad?.slug}`"
          title="Previsualizar anuncio"
          aria-label="Previsualizar anuncio"
          target="_blank"
          rel="noopener noreferrer"
        />

        <!-- Botón para rechazados -->
        <ButtonIcon
          v-if="ad?.status === 'rejected'"
          :icon="IconInfo"
          title="Ver razón"
          aria-label="Ver razón"
          @click="handleRejectedClick"
        />

        <!-- Botón para expirados -->
        <ButtonIcon
          v-if="ad?.status === 'expired'"
          :icon="IconRefreshCw"
          title="Publicar nuevamente"
          aria-label="Publicar nuevamente"
          @click="handleRepublish"
        />

        <!-- Botón para baneados -->
        <ButtonIcon
          v-if="ad?.status === 'banned'"
          :icon="IconInfo"
          title="Ver razón"
          aria-label="Ver razón"
          @click="handleBannedClick"
        />
      </div>
    </div>
  </article>
  <LightboxRazon
    :is-open="isDeactivateLightboxOpen"
    title="Desactivar publicación"
    description="Esta razón quedará registrada en el anuncio."
    initial-reason="Ya vendí el producto."
    :loading="isDeactivating"
    submit-label="Desactivar"
    cancel-label="Cancelar"
    @close="closeDeactivateLightbox"
    @submit="handleDeactivateSubmit"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
const { Swal } = useSweetAlert2();
import { useAdStore } from "@/stores/ad.store";
import { useCommunesStore } from "@/stores/communes.store";
import { useUserStore } from "@/stores/user.store";
import type { GalleryItem } from "@/types/ad";
import {
  Star as IconStar,
  Eye as IconEye,
  Info as IconInfo,
  RefreshCw as IconRefreshCw,
  Power as IconPower,
} from "lucide-vue-next";
import { useImageProxy } from "@/composables/useImage";
import ButtonIcon from "@/components/ButtonIcon.vue";

const { transformUrl } = useImageProxy();
const adStore = useAdStore();
const communesStore = useCommunesStore();
const userStore = useUserStore();

const props = defineProps({
  ad: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  status: {
    type: String,
    default: "",
  },
});

const lastFiveImages = computed(() => {
  const gallery = props.ad?.gallery || [];
  const start = Math.max(0, gallery.length - 5);
  return gallery.slice(start).map((img: GalleryItem) => transformUrl(img.url));
});

const statusMessage = computed(() => {
  const status = props.ad?.status;
  const days = props.ad?.remaining_days;
  const createdAt = props.ad?.createdAt
    ? new Date(props.ad.createdAt).getTime()
    : 0;
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

const formatDate = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} de ${month} del ${year}`;
};

const handleRepublish = async () => {
  const ad = props.ad;

  const fillAdStore = async () => {
    if (!ad) return;

    adStore.clearAll();
    // Actualizamos solo con los campos necesarios y sus IDs cuando corresponda
    adStore.updatePrice(Number(ad.price));
    adStore.updateName(ad.name);
    adStore.updateCategory(ad.category.id);
    adStore.updateEmail(ad.email);
    adStore.updatePhone(ad.phone);

    // Asegúrate de que los datos de communes estén cargados
    if (communesStore.getCommunes.data.length === 0) {
      await communesStore.loadCommunes();
    }

    // Usamos el store de communes para obtener el region.id
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

    // Actualizamos la galería con URLs absolutas para que UploadImages las muestre bien
    const updatedGallery: GalleryItem[] = ad.gallery.map(
      (img: { id: number; url: string }) => ({
        id: String(img.id),
        url: transformUrl(img.url),
      }),
    );
    adStore.updateGallery(updatedGallery);

    // Actualizamos los detalles
    if (ad.details) {
      adStore.updatePack(ad.details.pack);
      adStore.updateFeatured(ad.details.featured);
      adStore.updateIsInvoice(ad.details.is_invoice);
    }

    // Actualizamos el paso
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

const isDeactivateLightboxOpen = ref(false);
const isDeactivating = ref(false);

const handleDeactivate = () => {
  isDeactivateLightboxOpen.value = true;
};

const closeDeactivateLightbox = () => {
  isDeactivateLightboxOpen.value = false;
};

const handleDeactivateSubmit = async (reason: string) => {
  if (!props.ad?.id) return;
  isDeactivating.value = true;
  try {
    await userStore.deactivateAd(props.ad.id, reason);
    closeDeactivateLightbox();
    await Swal.fire({
      title: "Publicación desactivada",
      text: "Tu publicación ha sido desactivada exitosamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
    window.location.reload();
  } catch (error) {
    console.error("Error al desactivar publicación:", error);
    Swal.fire({
      title: "Error",
      text: "No se pudo desactivar la publicación. Por favor, intenta nuevamente.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    isDeactivating.value = false;
  }
};

const handlePushImage = (response: any) => {
  const imageUrl = response.formats?.thumbnail?.url || response.url;
  const newImage: GalleryItem = {
    id: String(response.id),
    url: imageUrl,
    formats: response.formats,
  };

  const currentGallery: GalleryItem[] = props.ad?.gallery || [];
  adStore.updateGallery([...currentGallery, newImage]);
};
</script>

<style scoped>
.icon {
  width: 14px;
  height: 14px;
  color: var(--light-peach);
}
</style>
