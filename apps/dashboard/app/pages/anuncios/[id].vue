<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
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
          @click="handleReject"
        >
          Rechazar
        </button>
        <button
          v-if="isActive"
          type="button"
          class="btn btn--primary btn--block"
          @click="handleBan"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";
import GalleryDefault from "@/components/GalleryDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<any>(null);
const strapi = useStrapi();
const strapiClient = useStrapiClient();
const { Swal } = useSweetAlert2();

const title = computed(() => item.value?.name || "Anuncio");
type AdStatus = "pending" | "active" | "archived" | "rejected";

const statusBreadcrumbMap: Record<AdStatus, { label: string; to: string }> = {
  pending: { label: "Pendientes", to: "/anuncios/pendientes" },
  active: { label: "Activos", to: "/anuncios/activos" },
  archived: { label: "Archivados", to: "/anuncios/archivados" },
  rejected: { label: "Rechazados", to: "/anuncios/rechazados" },
};

const breadcrumbs = computed(() => {
  const status = item.value?.status as AdStatus | undefined;
  const safeStatus: AdStatus =
    status && status in statusBreadcrumbMap ? status : "pending";
  const parent = statusBreadcrumbMap[safeStatus];

  return [
    { label: "Anuncios", to: parent.to },
    { label: parent.label, to: parent.to },
    ...(item.value?.name ? [{ label: item.value.name }] : []),
  ];
});

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  active: "Activo",
  rejected: "Rechazado",
  archived: "Archivado",
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

const handleApprove = async () => {
  if (!item.value?.id) return;
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

const handleReject = async () => {
  if (!item.value?.id) return;
  try {
    await strapiClient(`/ads/${item.value.id}/reject`, {
      method: "PUT",
      body: { reason_rejected: "" },
    });
    await fetchAd();
  } catch (error) {
    console.error("Error rejecting ad:", error);
  }
};

const handleBan = async () => {
  if (!item.value?.id) return;
  try {
    await strapiClient(`/ads/${item.value.id}/deactivate`, {
      method: "PUT",
    });
    await fetchAd();
  } catch (error) {
    console.error("Error deactivating ad:", error);
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
