<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Información" :columns="2">
        <CardInfo v-if="item" title="ID" :description="String(item.id)" />
        <CardInfo
          v-if="item"
          title="Usuario"
          :description="item.user?.username || '--'"
        />
        <CardInfo
          v-if="item"
          title="Anuncio"
          :description="item.ad?.name || '--'"
        />
        <CardInfo
          v-if="item"
          title="Precio"
          :description="formatCurrency(item.price)"
        />
        <CardInfo
          v-if="item"
          title="Días"
          :description="formatDays(item.total_days)"
        />
        <CardInfo
          v-if="item"
          title="Descripción"
          :description="item.description || '--'"
        />
      </BoxInformation>
    </template>
    <template #sidebar>
      <BoxInformation title="Detalles" :columns="1">
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
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<any>(null);

const title = computed(() =>
  item.value?.id ? `Destacado #${item.value.id}` : "Destacado",
);
const breadcrumbs = computed(() => [
  { label: "Destacados", to: "/destacados/libres" },
  ...(item.value?.id ? [{ label: `#${item.value.id}` }] : []),
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

const formatCurrency = (amount: number | string | undefined) => {
  if (amount === undefined || amount === null) return "--";
  const numAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

const formatDays = (days?: number) => {
  if (!days && days !== 0) return "--";
  return `${days} días`;
};

const { data: featuredData } = await useAsyncData(
  `featured-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;
    try {
      const strapi = useStrapi();
      const response = await strapi.find("ad-featured-reservations", {
        filters: {
          id: {
            $eq: id,
          },
        },
        populate: {
          user: {
            fields: ["username"],
          },
          ad: {
            fields: ["name"],
          },
        },
      });
      const data = Array.isArray(response.data) ? response.data[0] : null;
      if (data) return data;

      const fallback = await strapi.findOne(
        "ad-featured-reservations",
        id as string,
        {
          populate: {
            user: {
              fields: ["username"],
            },
            ad: {
              fields: ["name"],
            },
          },
        },
      );
      return fallback.data || null;
    } catch (error) {
      console.error("Error fetching featured reservation:", error);
      return null;
    }
  },
);

item.value = featuredData.value;
</script>
