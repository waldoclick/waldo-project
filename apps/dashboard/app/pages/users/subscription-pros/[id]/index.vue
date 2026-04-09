<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Información" :columns="2">
          <CardInfo
            v-if="item"
            title="Usuario"
            :description="item.user?.email || '--'"
          />
          <CardInfo
            v-if="item"
            title="Tipo de tarjeta"
            :description="item.card_type || '--'"
          />
          <CardInfo
            v-if="item"
            title="Últimos 4 dígitos"
            :description="item.card_last4 || '--'"
          />
          <CardInfo
            v-if="item"
            title="Factura pendiente"
            :description="item.pending_invoice ? 'Sí' : 'No'"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";
import { formatDate } from "@/utils/date";
import type { SubscriptionPro } from "@/types/subscription-pro";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<SubscriptionPro | null>(null);
const apiClient = useApiClient();

const title = computed(() => item.value?.user?.email || "Subscripción PRO");
const breadcrumbs = computed(() => [
  { label: "Subscripciones PRO", to: "/subscription-pros" },
  ...(item.value?.user?.email ? [{ label: item.value.user.email }] : []),
]);

const { data: itemData } = await useAsyncData(
  `subscription-pro-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("subscription-pros", {
      method: "GET",
      params: {
        filters: { documentId: { $eq: id } },
        populate: { user: { fields: ["email", "username"] } },
      } as unknown as Record<string, unknown>,
    })) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = (await apiClient(`subscription-pros/${id}`, {
      method: "GET",
      params: {
        populate: { user: { fields: ["email", "username"] } },
      } as unknown as Record<string, unknown>,
    })) as { data: unknown };
    return (fallback.data as unknown) || null;
  },
  { default: () => null },
);

item.value = (itemData.value as SubscriptionPro | null) ?? null;
</script>
