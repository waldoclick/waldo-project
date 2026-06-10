<template>
  <div>
    <HeroDefaultDashboard title="Usadas" :breadcrumbs="breadcrumbs">
      <template #actions>
        <button class="btn btn--primary" type="button" @click="giftOpen = true">
          Regalar Reservas
        </button>
      </template>
    </HeroDefaultDashboard>
    <ReservationsUsed ref="tableRef" />
    <LightboxGift
      :is-open="giftOpen"
      endpoint="ad-reservations"
      label="reservas"
      @close="giftOpen = false"
      @gifted="handleGifted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ReservationsUsed from "@/components/ReservationsUsed.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Reservas", to: "/dashboard/reservations/free" },
  { label: "Usadas" },
];

const giftOpen = ref(false);
const tableRef = ref<InstanceType<typeof ReservationsUsed> | null>(null);

function handleGifted() {
  giftOpen.value = false;
  tableRef.value?.refresh();
}
</script>
