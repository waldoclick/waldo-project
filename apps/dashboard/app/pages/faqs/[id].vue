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
const faqTitle = ref<string>("");

const title = computed(() => faqTitle.value || "FAQ");
const breadcrumbs = computed(() => [
  { label: "FAQs", to: "/faqs" },
  ...(faqTitle.value ? [{ label: faqTitle.value }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("faqs", id as string);
      if (response.data?.title) {
        faqTitle.value = response.data.title;
      }
    } catch (error) {
      console.error("Error fetching FAQ:", error);
    }
  }
});
</script>
