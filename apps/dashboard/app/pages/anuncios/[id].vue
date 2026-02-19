<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
    <template v-if="statusIcon" #titlePrefix>
      <component :is="statusIcon" aria-hidden="true" />
    </template>
  </HeroDefault>
  <BoxContent>
    <template #content>
      <BoxInformation
        v-if="item?.reason_for_ban"
        title="Razón del baneo"
        :columns="1"
      >
        <template #titlePrefix>
          <AlertTriangle aria-hidden="true" />
        </template>
        <CardInfo
          v-if="item?.banned_at"
          title="Fecha"
          :description="formatDate(item.banned_at)"
        />
        <CardInfo title="Detalle" :description="item.reason_for_ban" />
      </BoxInformation>
      <BoxInformation
        v-if="item?.reason_for_rejection"
        title="Razón del rechazo"
        :columns="1"
      >
        <CardInfo
          v-if="item?.rejected_at"
          title="Fecha"
          :description="formatDate(item.rejected_at)"
        />
        <CardInfo title="Detalle" :description="item.reason_for_rejection" />
      </BoxInformation>
      <BoxInformation title="Información" :columns="2">
        <CardInfo v-if="item" title="Nombre" :description="item.name" />
        <CardInfo v-if="item" title="Slug" :description="item.slug" />
        <CardInfo
          v-if="item"
          title="Descripción"
          :description="item.description || '--'"
        />
        <CardInfo
          v-if="item"
          title="Precio"
          :description="formatPrice(item.price, item.currency)"
        />
        <CardInfo
          v-if="item"
          title="Categoría"
          :description="item.category?.name || '--'"
        />
        <CardInfo
          v-if="item"
          title="Condición"
          :description="item.condition?.name || '--'"
        />
        <CardInfo
          v-if="item"
          title="Comuna"
          :description="item.commune?.name || '--'"
        />
        <CardInfo
          v-if="item"
          title="Dirección"
          :description="formatAddress(item.address, item.address_number)"
        />
        <CardInfo
          v-if="item"
          title="Teléfono"
          :description="item.phone || '--'"
        />
        <CardInfo v-if="item" title="Email" :description="item.email || '--'" />
        <CardInfo
          v-if="item"
          title="Duración"
          :description="`${item.duration_days} días`"
        />
        <CardInfo
          v-if="item"
          title="Días Restantes"
          :description="`${item.remaining_days} días`"
        />
        <CardInfo
          v-if="item"
          title="Moneda"
          :description="item.currency || '--'"
        />
      </BoxInformation>

      <BoxInformation
        v-if="item?.gallery && item.gallery.length > 0"
        title="Galería de imágenes"
        :columns="1"
      >
        <GalleryDefault
          :images="item.gallery"
          :alt-prefix="item.name"
          :columns="4"
          @image-delete="handleDeleteImage"
        />
      </BoxInformation>
    </template>
    <template #sidebar>
      <BoxInformation title="Acciones" :columns="1">
        <button
          v-if="isPending"
          type="button"
          class="btn btn--buy btn--block"
          @click="handleApprove"
        >
          Aprobar
        </button>
        <button
          v-if="isPending"
          type="button"
          class="btn btn--secondary btn--block"
          @click="openRejectLightbox"
        >
          Rechazar
        </button>
        <a
          v-if="isActive && item?.slug"
          :href="`${websiteUrl}/anuncios/${item.slug}`"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn--primary btn--block"
        >
          Ver anuncio
        </a>
        <button
          v-if="isActive"
          type="button"
          class="btn btn--secondary btn--block"
          @click="openBanLightbox"
        >
          Banear
        </button>
      </BoxInformation>
      <BoxInformation title="Detalles" :columns="1">
        <CardInfo
          v-if="item"
          title="Estado"
          :description="getStatusText(item)"
        />
        <CardInfo
          v-if="item"
          title="Fecha de creación"
          :description="formatDate(item.createdAt)"
        />
        <CardInfo
          v-if="item"
          title="Última modificación"
          :description="formatDate(item.updatedAt)"
        />
      </BoxInformation>
    </template>
  </BoxContent>
  <LightboxRazon
    :is-open="isRejectLightboxOpen"
    title="Razón del rechazo"
    description="Esta razón se enviará al usuario y quedará registrada en el anuncio."
    :initial-reason="defaultRejectionReason"
    :loading="isRejecting"
    @close="closeRejectLightbox"
    @submit="handleReject"
  />
  <LightboxRazon
    :is-open="isBanLightboxOpen"
    title="Razón del baneo"
    description="Esta razón quedará registrada en el anuncio."
    :initial-reason="defaultBanReason"
    :loading="isBanning"
    @close="closeBanLightbox"
    @submit="handleBan"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";
import GalleryDefault from "@/components/GalleryDefault.vue";
import LightboxRazon from "@/components/LightboxRazon.vue";
import {
  Clock,
  CheckCircle,
  Archive,
  Ban,
  XCircle,
  AlertTriangle,
} from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<any>(null);
const { public: publicConfig } = useRuntimeConfig();
const websiteUrl =
  (publicConfig.websiteUrl as string) || "http://localhost:3000";
const strapi = useStrapi();
const strapiClient = useStrapiClient();
const { Swal } = useSweetAlert2();

const title = computed(() => item.value?.name || "Anuncio");
type AdStatus = "pending" | "active" | "archived" | "banned" | "rejected";

const statusIconMap: Record<AdStatus, any> = {
  pending: Clock,
  active: CheckCircle,
  archived: Archive,
  banned: Ban,
  rejected: XCircle,
};

const statusBreadcrumbMap: Record<AdStatus, { label: string; to: string }> = {
  pending: { label: "Pendientes", to: "/anuncios/pendientes" },
  active: { label: "Activos", to: "/anuncios/activos" },
  archived: { label: "Archivados", to: "/anuncios/archivados" },
  banned: { label: "Baneados", to: "/anuncios/baneados" },
  rejected: { label: "Rechazados", to: "/anuncios/rechazados" },
};

const breadcrumbs = computed(() => {
  const status = item.value?.status as AdStatus | undefined;
  const safeStatus: AdStatus =
    status && status in statusBreadcrumbMap ? status : "pending";
  const parent = statusBreadcrumbMap[safeStatus];

  return [
    { label: "Anuncios", to: "/anuncios/pendientes" },
    { label: parent.label, to: parent.to },
    ...(item.value?.name ? [{ label: item.value.name }] : []),
  ];
});

const statusIcon = computed(() => {
  const status = item.value?.status as AdStatus | undefined;
  return status && status in statusIconMap ? statusIconMap[status] : null;
});

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  active: "Activo",
  archived: "Archivado",
  banned: "Baneado",
  rejected: "Rechazado",
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: number, currency: string = "CLP") => {
  if (!price) return "--";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency,
  }).format(price);
};

const formatAddress = (address: string, addressNumber: string) => {
  if (!address) return "--";
  return addressNumber ? `${address} ${addressNumber}` : address;
};

const getStatusText = (ad: any) => {
  if (!ad?.status) return "--";
  return statusLabels[ad.status] || ad.status;
};

const isPending = computed(() => item.value?.status === "pending");
const isActive = computed(() => item.value?.status === "active");
const isRejectLightboxOpen = ref(false);
const isBanLightboxOpen = ref(false);
const isRejecting = ref(false);
const isBanning = ref(false);
const defaultRejectionReason =
  "Su anuncio fue rechazado porque no cumple con las políticas y términos de uso de Waldo.click®.";
const defaultBanReason =
  "Su anuncio fue baneado porque no cumple con las políticas y términos de uso de Waldo.click®.";

const openRejectLightbox = () => {
  isRejectLightboxOpen.value = true;
};

const closeRejectLightbox = () => {
  isRejectLightboxOpen.value = false;
};

const openBanLightbox = () => {
  isBanLightboxOpen.value = true;
};

const closeBanLightbox = () => {
  isBanLightboxOpen.value = false;
};

const handleApprove = async () => {
  if (!item.value?.id && !item.value?.documentId && !route.params.id) return;
  try {
    await strapiClient(`/ads/${item.value.id}/approve`, {
      method: "PUT",
    });
    await fetchAd();
    Swal.fire("Éxito", "Anuncio aprobado correctamente.", "success");
  } catch (error) {
    console.error("Error approving ad:", error);
  }
};

const handleReject = async (reason: string) => {
  if (!item.value?.id) return;
  isRejecting.value = true;
  try {
    await strapiClient(`/ads/${item.value.id}/reject`, {
      method: "PUT",
      body: { reason_rejected: reason },
    });
    await fetchAd();
    closeRejectLightbox();
    Swal.fire("Éxito", "Anuncio rechazado correctamente.", "success");
  } catch (error) {
    console.error("Error rejecting ad:", error);
    Swal.fire("Error", "No se pudo rechazar el anuncio.", "error");
  } finally {
    isRejecting.value = false;
  }
};

const handleBan = async (reason: string) => {
  if (!item.value?.id) return;
  isBanning.value = true;
  try {
    await strapiClient(`/ads/${item.value.id}/deactivate`, {
      method: "PUT",
      body: { reason_for_ban: reason },
    });
    await fetchAd();
    closeBanLightbox();
    Swal.fire("Éxito", "Anuncio baneado correctamente.", "success");
  } catch (error) {
    console.error("Error deactivating ad:", error);
    Swal.fire("Error", "No se pudo banear el anuncio.", "error");
  } finally {
    isBanning.value = false;
  }
};

const handleDeleteImage = async ({ image }: { image: { id?: number } }) => {
  if (!item.value?.id) return;
  if (!image?.id) {
    await Swal.fire(
      "Error",
      "No se pudo identificar la imagen para eliminar.",
      "error",
    );
    return;
  }

  const result = await Swal.fire({
    title: "¿Está seguro de eliminar la imagen?",
    text: "Esta acción eliminará la imagen del anuncio.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;

  try {
    const galleryIds =
      item.value?.gallery?.map(
        (galleryImage: { id: number }) => galleryImage.id,
      ) || [];
    const updatedGallery = galleryIds.filter((id: number) => id !== image.id);

    const adDocumentId =
      item.value?.documentId || route.params.id || item.value?.id;
    if (!adDocumentId) {
      await Swal.fire(
        "Error",
        "No se pudo identificar el anuncio para actualizar.",
        "error",
      );
      return;
    }

    await strapi.update("ads", adDocumentId, {
      gallery: updatedGallery,
    });

    await strapi.delete("upload/files", image.id);

    await fetchAd();
    await Swal.fire("Éxito", "Imagen eliminada correctamente.", "success");
  } catch (error) {
    console.error("Error deleting image:", error);
    await Swal.fire("Error", "No se pudo eliminar la imagen.", "error");
  }
};

const fetchAd = async () => {
  const id = route.params.id;
  if (!id) return;
  try {
    const response = await strapi.findOne("ads", id as string, {
      populate: {
        category: true,
        condition: true,
        commune: true,
        gallery: true,
      },
    });
    if (response.data) {
      item.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching ad:", error);
  }
};

onMounted(async () => {
  await fetchAd();
});
</script>
