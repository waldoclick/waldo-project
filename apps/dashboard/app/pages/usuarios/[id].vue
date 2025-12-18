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
const userName = ref<string>("");

const title = computed(() => userName.value || "Usuario");
const breadcrumbs = computed(() => [
  { label: "Usuarios", to: "/usuarios" },
  ...(userName.value ? [{ label: userName.value }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("users", id as string);
      if (response.data?.username) {
        userName.value = response.data.username;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }
});
</script>
