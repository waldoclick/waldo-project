<template>
  <div class="search search--default">
    <div class="search--default__wrapper">
      <Search class="search--default__icon" />
      <input
        :value="modelValue"
        :placeholder="placeholder"
        maxlength="40"
        class="search--default__input"
        @input="
          $emit(
            'update:modelValue',
            ($event.target as HTMLInputElement).value.slice(0, 40),
          )
        "
      />
      <button
        v-if="modelValue"
        type="button"
        class="search--default__clear"
        title="Limpiar búsqueda"
        @click="$emit('update:modelValue', '')"
      >
        <X class="search--default__clear__icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, X } from "lucide-vue-next";

defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>
