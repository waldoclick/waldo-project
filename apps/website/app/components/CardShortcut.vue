<template>
  <nuxt-link :to="to" class="card card--shortcut" :title="title">
    <span class="card--shortcut__header">
      <component :is="iconComponent" class="card--shortcut__icon" />
      <h3 class="card--shortcut__title">{{ title }}</h3>
    </span>
    <p class="card--shortcut__description">{{ description }}</p>
    <span class="card--shortcut__link">{{ linkText }}</span>
  </nuxt-link>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  to: string | object;
  iconComponent: Component;
  title: string;
  description: string;
  linkText: string;
}>();
</script>
