<template>
  <td
    class="table--default__cell"
    :class="{
      'table--default__cell--right': align === 'right',
      'table--default__cell--center': align === 'center',
    }"
  >
    <slot />
  </td>
</template>

<script setup lang="ts">
defineProps<{
  align?: "left" | "right" | "center";
}>();
</script>
