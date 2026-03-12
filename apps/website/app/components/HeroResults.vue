<template>
  <section class="hero hero--results" :style="heroStyle">
    <div class="hero--results__container">
      <div class="hero--results__breadcrumbs">
        <BreadcrumbsDefault :items="breadcrumbItems" />
      </div>

      <div class="hero--results__title">
        <div class="title title--category">
          <div v-if="categoryIcon" class="title--category__icon">
            <component :is="categoryIcon" :size="24" class="icon-category" />
          </div>
          <h1 class="title--category__text title">
            {{ title }}
          </h1>
        </div>
      </div>

      <div v-if="queryValue" class="hero--results__query">
        Resultados para: <b>{{ queryValue }}</b>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import { useRoute } from "vue-router";
import BreadcrumbsDefault from "@/components/BreadcrumbsDefault.vue";
import { useColor } from "../composables/useColor";

const { bgColorWithTransparency } = useColor();

const props = defineProps<{
  bgColor: string;
  title: string;
  categoryIcon?: Component;
  color?: string;
}>();

const route = useRoute();
const queryValue = computed(() => route.query.s?.toString() || "");

const heroStyle = computed(() => ({
  "--hero-bg-color": bgColorWithTransparency(props.bgColor || "#f0f0f0"),
  "--category-icon-bg-color": props.color || "transparent",
}));

const breadcrumbItems = computed(() => {
  const items = [{ label: "Anuncios", to: "/anuncios" }];
  if (props.title && props.title !== "Anuncios") {
    items.push({ label: props.title, to: "" });
  }
  return items;
});
</script>
