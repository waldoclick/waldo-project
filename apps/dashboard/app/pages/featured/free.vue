<template>
  <div>
    <HeroDefault title="Libres" :breadcrumbs="breadcrumbs">
      <template #actions>
        <button class="btn btn--primary" type="button" @click="giftOpen = true">
          Regalar Destacados
        </button>
      </template>
    </HeroDefault>
    <FeaturedFree />
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
import FeaturedFree from "@/components/FeaturedFree.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Destacados", to: "/featured/free" },
  { label: "Libres" },
];

const giftOpen = ref(false);
</script>
