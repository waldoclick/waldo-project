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
      <BoxInformation title="Detalles" :columns="1">
        <CardInfo
          v-if="item"
          title="Estado"
          :description="getStatusText(item)"
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

const title = computed(() => item.value?.name || "Anuncio");
const breadcrumbs = computed(() => [
  { label: "Anuncios", to: "/anuncios" },
  ...(item.value?.name ? [{ label: item.value.name }] : []),
]);

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
  if (ad.rejected) return "Rechazado";
  if (ad.active && ad.remaining_days > 0) return "Activo";
  if (
    !ad.active &&
    ad.remaining_days > 0 &&
    ad.remaining_days === ad.duration_days
  )
    return "Pendiente";
  if (!ad.active && ad.remaining_days === 0) return "Archivado";
  return "Inactivo";
};

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
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
  }
});
</script>
