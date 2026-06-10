<template>
  <div class="table table--default">
    <table class="table--default__table">
      <thead class="table--default__header">
        <tr class="table--default__row">
          <th
            v-for="(column, index) in columns"
            :key="index"
            class="table--default__head"
            :class="{
              'table--default__head--right': column.align === 'right',
            }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="table--default__body">
        <slot />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: Array<{
    label: string;
    align?: "left" | "right" | "center";
  }>;
}>();
</script>
