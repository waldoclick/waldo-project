<template>
  <span
    class="badge badge--default"
    :class="{
      'badge--default--outline': variant === 'outline',
      'badge--default--secondary': variant === 'secondary',
    }"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{
  variant?: "default" | "outline" | "secondary";
}>();
</script>
