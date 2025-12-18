<template>
  <div class="memo memo--default">
    <component :is="icon" :size="40" class="memo--default__icon" />
    <div class="memo--default__text">
      <p>{{ text }}</p>
    </div>
    <NuxtLink
      v-if="link && buttonText"
      :to="link"
      class="btn btn--buy"
      :title="buttonText"
    >
      {{ buttonText }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next";

defineProps<{
  icon: LucideIcon;
  text: string;
  buttonText?: string;
  link: string;
}>();
</script>
