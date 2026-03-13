<template>
  <div class="input input--autocomplete">
    <input
      ref="inputRef"
      v-model="query"
      type="text"
      class="form__control"
      :placeholder="placeholder"
      autocomplete="off"
      @focus="isOpen = true"
      @blur="handleBlur"
      @input="handleInput"
    />
    <ul
      v-if="isOpen && options.length > 0"
      class="input--autocomplete__dropdown"
    >
      <li
        v-for="option in options"
        :key="option.value"
        class="input--autocomplete__dropdown__item"
        @mousedown.prevent="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>
    <p
      v-if="isOpen && query.length >= 2 && !loading && options.length === 0"
      class="input--autocomplete__empty"
    >
      Sin resultados
    </p>
    <p
      v-if="isOpen && loading && query.length >= 2"
      class="input--autocomplete__empty"
    >
      Buscando...
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "search", query: string): void;
}>();

const query = ref("");
const isOpen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function handleInput() {
  // Clear selected value when user types again
  emit("update:modelValue", "");
  isOpen.value = true;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit("search", query.value.trim());
  }, 300);
}

function selectOption(option: { label: string; value: string }) {
  query.value = option.label;
  emit("update:modelValue", option.value);
  isOpen.value = false;
}

function handleBlur() {
  setTimeout(() => {
    isOpen.value = false;
  }, 150);
}

watch(
  () => props.modelValue,
  (val) => {
    if (val === "") {
      query.value = "";
    }
  },
);
</script>
