<template>
  <div class="search search--dashboard">
    <div class="search--dashboard__wrapper">
      <Search class="search--dashboard__icon" />
      <input
        :value="modelValue"
        :placeholder="placeholder"
        maxlength="40"
        class="search--dashboard__input"
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
        class="search--dashboard__clear"
        title="Limpiar búsqueda"
        @click="$emit('update:modelValue', '')"
      >
        <X class="search--dashboard__clear__icon" />
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
