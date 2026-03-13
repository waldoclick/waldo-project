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
    />
    <ul
      v-if="isOpen && filtered.length > 0"
      class="input--autocomplete__dropdown"
    >
      <li
        v-for="option in filtered"
        :key="option.value"
        class="input--autocomplete__dropdown__item"
        @mousedown.prevent="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>
    <p
      v-if="isOpen && query && filtered.length === 0"
      class="input--autocomplete__empty"
    >
      Sin resultados
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps<{
  modelValue: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}>();

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const query = ref("");
const isOpen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const filtered = computed(() =>
  props.options.filter((o) =>
    o.label.toLowerCase().includes(query.value.trim().toLowerCase()),
  ),
);

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
