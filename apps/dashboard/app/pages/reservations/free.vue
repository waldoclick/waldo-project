<template>
  <div>
    <HeroDefault title="Libres" :breadcrumbs="breadcrumbs">
      <template #actions>
        <button class="btn btn--primary" type="button" @click="giftOpen = true">
          Regalar Reservas
        </button>
      </template>
    </HeroDefault>
    <ReservationsFree ref="tableRef" />
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
import HeroDefault from "@/components/HeroDefault.vue";
import ReservationsFree from "@/components/ReservationsFree.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Reservas", to: "/reservations/free" },
  { label: "Libres" },
];

const giftOpen = ref(false);
const tableRef = ref<InstanceType<typeof ReservationsFree> | null>(null);

function handleGifted() {
  giftOpen.value = false;
  tableRef.value?.refresh();
}
</script>
