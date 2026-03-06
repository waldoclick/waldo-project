<template>
  <div>
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
            :description="
              formatCurrency(item.price, { currency: item.currency })
            "
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
          <CardInfo
            v-if="item"
            title="Email"
            :description="item.email || '--'"
          />
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
            :href="`${websiteUrl}/ads/${item.slug}`"
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
      @submit="handleBanned"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from "vue";
import { formatCurrency } from "@/utils/price";
import { formatAddress } from "@/utils/string";
import type { Ad, AdStatus } from "@/types/ad";
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
  AlertCircle,
  Ban,
  XCircle,
  XOctagon,
  AlertTriangle,
} from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<Ad | null>(null);
const { public: publicConfig } = useRuntimeConfig();
const websiteUrl =
  (publicConfig.websiteUrl as string) || "http://localhost:3000";
const strapi = useStrapi();
const strapiClient = useStrapiClient();
const { Swal } = useSweetAlert2();

const title = computed(() => item.value?.name || "Anuncio");

const statusIconMap: Record<AdStatus, Component> = {
  pending: Clock,
  active: CheckCircle,
  archived: AlertCircle,
  banned: Ban,
  rejected: XCircle,
  abandoned: XOctagon,
};

const statusBreadcrumbMap: Record<AdStatus, { label: string; to: string }> = {
  pending: { label: "Pendientes", to: "/ads/pending" },
  active: { label: "Activos", to: "/ads/active" },
  archived: { label: "Expirados", to: "/ads/expired" },
  banned: { label: "Baneados", to: "/ads/banned" },
  rejected: { label: "Rechazados", to: "/ads/rejected" },
  abandoned: { label: "Abandonados", to: "/ads/abandoned" },
};

const breadcrumbs = computed(() => {
  const status = item.value?.status as AdStatus | undefined;
  const safeStatus: AdStatus =
    status && status in statusBreadcrumbMap ? status : "pending";
  const parent = statusBreadcrumbMap[safeStatus];

  return [
    { label: "Anuncios", to: "/ads/pending" },
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
  archived: "Expirado",
  banned: "Baneado",
  rejected: "Rechazado",
  abandoned: "Abandonado",
};

const getStatusText = (ad: Ad) => {
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
  const adId = item.value?.id ?? route.params.id;
  if (!adId) return;
  try {
    await strapiClient(`/ads/${adId}/approve`, {
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

const handleBanned = async (reason: string) => {
  if (!item.value?.id) return;
  isBanning.value = true;
  try {
    await strapiClient(`/ads/${item.value.id}/banned`, {
      method: "PUT",
      body: { reason_for_ban: reason },
    });
    await fetchAd();
    closeBanLightbox();
    Swal.fire("Éxito", "Anuncio baneado correctamente.", "success");
  } catch (error) {
    console.error("Error banning ad:", error);
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
    const galleryItems = item.value?.gallery as
      | Array<{ id?: number; url: string }>
      | undefined;
    const galleryIds =
      galleryItems
        ?.map((g) => g.id)
        .filter((id): id is number => id !== undefined) || [];
    const updatedGallery = galleryIds.filter((id: number) => id !== image.id);

    const adDocumentId =
      item.value?.documentId ||
      (route.params.id as string) ||
      item.value?.id?.toString();
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
    } as Record<string, unknown>);

    await strapi.delete("upload/files", String(image.id));

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
    const response = await strapi.findOne(
      "ads",
      id as string,
      {
        populate: {
          category: true,
          condition: true,
          commune: true,
          gallery: true,
        },
      } as Record<string, unknown>,
    );
    if (response.data) {
      item.value = response.data as unknown as Ad;
    }
  } catch (error) {
    console.error("Error fetching ad:", error);
  }
};

onMounted(async () => {
  await fetchAd();
});
</script>
