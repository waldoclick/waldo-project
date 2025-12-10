<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :target="target"
    :rel="rel"
    :class="['btn', 'btn--icon', customClass]"
    :title="title"
    :aria-label="ariaLabel"
    @click="$emit('click', $event)"
  >
    <component :is="icon" :size="iconSize" />
  </NuxtLink>

  <a
    v-else-if="href"
    :href="href"
    :target="target"
    :rel="rel"
    :class="['btn', 'btn--icon', customClass]"
    :title="title"
    :aria-label="ariaLabel"
    @click="$emit('click', $event)"
  >
    <component :is="icon" :size="iconSize" />
  </a>

  <button
    v-else
    :type="type"
    :class="['btn', 'btn--icon', customClass]"
    :title="title"
    :aria-label="ariaLabel"
    @click="$emit('click', $event)"
  >
    <component :is="icon" :size="iconSize" />
  </button>
</template>

<script setup lang="ts">
import type { Component } from "vue";

interface Props {
  icon: Component;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
  ariaLabel?: string;
  customClass?: string;
  iconSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 18,
  type: "button",
  customClass: "",
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>
