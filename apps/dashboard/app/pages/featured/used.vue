<template>
  <div>
    <HeroDefault title="Usados" :breadcrumbs="breadcrumbs">
      <template #actions>
        <button class="btn btn--primary" type="button" @click="giftOpen = true">
          Regalar Destacados
        </button>
      </template>
    </HeroDefault>
    <FeaturedUsed />
    <LightboxGift
      :is-open="giftOpen"
      endpoint="ad-featured-reservations"
      label="reservas destacadas"
      @close="giftOpen = false"
      @gifted="giftOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import HeroDefault from "@/components/HeroDefault.vue";
import FeaturedUsed from "@/components/FeaturedUsed.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Destacados", to: "/featured/free" },
  { label: "Usados" },
];

const giftOpen = ref(false);
</script>
