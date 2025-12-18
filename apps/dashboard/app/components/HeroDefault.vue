<template>
  <section class="hero hero--default">
    <div class="hero--default__container">
      <div class="hero--default__content">
        <div class="hero--default__breadcrumbs">
          <BreadcrumbsDefault :items="breadcrumbs" />
        </div>
        <div class="hero--default__title">
          <h1 class="title">{{ title }}</h1>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BreadcrumbsDefault from "@/components/BreadcrumbsDefault.vue";

const props = defineProps<{
  title: string;
  breadcrumbs?: Array<{
    label: string;
    to?: string;
  }>;
}>();

const breadcrumbs = computed(() => props.breadcrumbs || []);
</script>
