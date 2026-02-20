<template>
  <article class="card card--stat">
    <div class="card--stat__title">{{ title }}</div>
    <div class="card--stat__value">{{ formattedValue }}</div>
    <NuxtLink v-if="link" :to="link.to" class="card--stat__link">
      <ArrowRight :size="12" class="card--stat__link__icon" />
      {{ link.text }}
    </NuxtLink>
    <div class="card--stat__icon" :style="{ backgroundColor: iconBgColor }">
      <component
        :is="icon"
        :size="24"
        class="card--stat__icon__svg"
        :style="{ color: iconColor }"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight } from "lucide-vue-next";
import type { Component } from "vue";

const props = defineProps<{
  title: string;
  value: string | number;
  link?: { text: string; to: string };
  icon: Component;
  iconColor: string;
  iconBgColor: string;
}>();

const formattedValue = computed(() => {
  const val = props.value;
  if (typeof val === "number") {
    return new Intl.NumberFormat("es-CL").format(val);
  }
  return val;
});
</script>
