<template>
  <td
    class="table-cell"
    :class="{
      'table-cell--right': align === 'right',
      'table-cell--center': align === 'center',
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
