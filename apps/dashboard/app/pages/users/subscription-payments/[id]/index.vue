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
            title="Monto"
            :description="formatCurrency(item.amount)"
          />
          <CardInfo v-if="item" title="Estado" :description="item.status" />
          <CardInfo
            v-if="item"
            title="Parent buy order"
            :description="item.parent_buy_order || '--'"
          />
          <CardInfo
            v-if="item"
            title="Child buy order"
            :description="item.child_buy_order || '--'"
          />
          <CardInfo
            v-if="item"
            title="Código de autorización"
            :description="item.authorization_code || '--'"
          />
          <CardInfo
            v-if="item"
            title="Código de respuesta"
            :description="item.response_code ?? '--'"
          />
          <CardInfo
            v-if="item"
            title="Intentos de cobro"
            :description="item.charge_attempts.toString()"
          />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="item"
            title="Período inicio"
            :description="formatDate(item.period_start ?? undefined)"
          />
          <CardInfo
            v-if="item"
            title="Período fin"
            :description="formatDate(item.period_end ?? undefined)"
          />
          <CardInfo
            v-if="item"
            title="Cobrado el"
            :description="formatDate(item.charged_at ?? undefined)"
          />
          <CardInfo
            v-if="item"
            title="Próximo intento"
            :description="formatDate(item.next_charge_attempt ?? undefined)"
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
import { formatCurrency } from "@/utils/price";
import type { SubscriptionPayment } from "@/types/subscription-payment";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<SubscriptionPayment | null>(null);
const apiClient = useApiClient();

const title = computed(() => `Pago #${item.value?.id ?? ""}`);
const breadcrumbs = computed(() => [
  { label: "Pagos de subscripción", to: "/subscription-payments" },
  ...(item.value ? [{ label: `Pago #${item.value.id}` }] : []),
]);

const { data: itemData } = await useAsyncData(
  `subscription-payment-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("subscription-payments", {
      method: "GET",
      params: {
        filters: { documentId: { $eq: id } },
        populate: { user: { fields: ["email", "username"] } },
      } as unknown as Record<string, unknown>,
    })) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = (await apiClient(`subscription-payments/${id}`, {
      method: "GET",
      params: {
        populate: { user: { fields: ["email", "username"] } },
      } as unknown as Record<string, unknown>,
    })) as { data: unknown };
    return (fallback.data as unknown) || null;
  },
  { default: () => null },
);

item.value = (itemData.value as SubscriptionPayment | null) ?? null;
</script>
