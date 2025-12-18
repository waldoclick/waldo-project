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
const orderId = ref<string>("");

const title = computed(() =>
  orderId.value ? `Orden #${orderId.value}` : "Orden",
);
const breadcrumbs = computed(() => [
  { label: "Órdenes", to: "/ordenes" },
  ...(orderId.value ? [{ label: `#${orderId.value}` }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    orderId.value = id as string;
  }
});
</script>
