<template>
  <div>
    <HeroDefault title="Usadas" :breadcrumbs="breadcrumbs">
      <template #actions>
        <button class="btn btn--primary" type="button" @click="giftOpen = true">
          Regalar Reservas
        </button>
      </template>
    </HeroDefault>
    <ReservationsUsed />
    <LightboxGift
      :is-open="giftOpen"
      endpoint="ad-reservations"
      label="reservas"
      @close="giftOpen = false"
      @gifted="giftOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import HeroDefault from "@/components/HeroDefault.vue";
import ReservationsUsed from "@/components/ReservationsUsed.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Reservas", to: "/reservations/free" },
  { label: "Usadas" },
];

const giftOpen = ref(false);
</script>
