<template>
  <nav class="breadcrumbs">
    <ul class="breadcrumbs__list">
      <li class="breadcrumbs__item">
        <NuxtLink to="/" class="breadcrumbs__link">Waldo</NuxtLink>
        <ChevronRight class="breadcrumbs__separator" />
      </li>
      <template v-for="(item, index) in items" :key="index">
        <li class="breadcrumbs__item">
          <NuxtLink v-if="item.to" :to="item.to" class="breadcrumbs__link">
            {{ item.label }}
          </NuxtLink>
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

<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";

defineProps<{
  items: Array<{
    label: string;
    to?: string;
  }>;
}>();
</script>
