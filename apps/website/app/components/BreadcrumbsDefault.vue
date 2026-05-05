<template>
  <nav class="breadcrumbs">
    <ul class="breadcrumbs__list">
      <li class="breadcrumbs__item">
        <router-link to="/" class="breadcrumbs__link">
          <Home class="breadcrumbs__home-icon" :size="16" />
          <span class="breadcrumbs__home-text">Waldo</span>
        </router-link>
        <ChevronRight class="breadcrumbs__separator" />
      </li>
      <template v-for="(item, index) in items" :key="index">
        <li class="breadcrumbs__item">
          <router-link v-if="item.to" :to="item.to" class="breadcrumbs__link">
            {{ item.label }}
          </router-link>
          <span v-else class="breadcrumbs__text">{{ item.label }}</span>
          <ChevronRight
            v-if="index < items.length - 1"
            class="breadcrumbs__separator"
          />
        </li>
      </template>
    </ul>
  </nav>
</template>

<script setup>
import { ChevronRight, Home } from "lucide-vue-next";

defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) => {
      return value.every(
        (item) =>
          typeof item === "object" &&
          "label" in item &&
          (!("to" in item) || typeof item.to === "string"),
      );
    },
  },
});
</script>
