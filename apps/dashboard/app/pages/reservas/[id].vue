<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
  <div></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const reservationId = ref<string>("");

const title = computed(() =>
  reservationId.value ? `Reserva #${reservationId.value}` : "Reserva",
);
const breadcrumbs = computed(() => [
  { label: "Reservas", to: "/reservas/libres" },
  ...(reservationId.value ? [{ label: `#${reservationId.value}` }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    reservationId.value = id as string;
  }
});
</script>
