<template>
  <section class="hero hero--article">
    <div class="hero--article__container">
      <div class="hero--article__breadcrumbs">
        <BreadcrumbsDefault :items="breadcrumbItems" />
      </div>
      <div class="hero--article__title">
        <h1>{{ props.title }}</h1>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BreadcrumbsDefault from "@/components/BreadcrumbsDefault.vue";

const props = defineProps<{
  title: string;
  categoryName: string;
  categorySlug: string;
}>();

const breadcrumbItems = computed(() => [
  { label: "Blog", to: "/blog" },
  { label: props.title },
]);
</script>
