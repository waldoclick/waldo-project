<template>
  <div class="input input--phone">
    <select
      v-model="selectedDialCode"
      class="input--phone__select"
      @change.stop="handleChange"
    >
      <option
        v-for="country in sortedCountries"
        :key="country.iso2"
        :value="country.dialCode"
      >
        {{ country.iso2.toUpperCase() }} {{ country.dialCode }}
      </option>
    </select>
    <input
      :value="localNumber"
      type="tel"
      class="input--phone__number"
      placeholder="9 XXXX XXXX"
      maxlength="12"
      @input.stop="handleNumberInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import countries from "@/data/countries.json";

interface Country {
  name: string;
  iso2: string;
  dialCode: string;
}

const typedCountries = countries as Country[];

const sortedCountries = computed<Country[]>(() => {
  const chile = typedCountries.find((c) => c.iso2 === "cl");
  const rest = typedCountries
    .filter((c) => c.iso2 !== "cl")
    .sort((a, b) => a.name.localeCompare(b.name));
  return chile ? [chile, ...rest] : rest;
});

const props = defineProps<{
  modelValue?: string;
  value?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const selectedDialCode = ref<string>("+56");
const localNumber = ref<string>("");

function parsePhone(value: string): { dialCode: string; localNumber: string } {
  if (!value || !value.startsWith("+")) {
    return { dialCode: "+56", localNumber: value ?? "" };
  }
  const sorted = [...typedCountries].sort(
    (a, b) => b.dialCode.length - a.dialCode.length,
  );
  for (const country of sorted) {
    if (value.startsWith(country.dialCode)) {
      return {
        dialCode: country.dialCode,
        localNumber: value.slice(country.dialCode.length),
      };
    }
  }
  return { dialCode: "+56", localNumber: value };
}

watch(
  () => props.modelValue ?? props.value ?? "",
  (val) => {
    const parsed = parsePhone(val);
    selectedDialCode.value = parsed.dialCode;
    if (parsed.localNumber !== "" || localNumber.value === "") {
      localNumber.value = parsed.localNumber;
    }
    const composed = parsed.dialCode + localNumber.value;
    if (composed !== val) {
      emit("update:modelValue", composed);
    }
  },
  { immediate: true },
);

function handleNumberInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const cleaned = input.value.replace(/\D/g, "").slice(0, 12);
  localNumber.value = cleaned;
  input.value = cleaned;
  emit("update:modelValue", selectedDialCode.value + cleaned);
}

function handleChange() {
  emit("update:modelValue", selectedDialCode.value + localNumber.value);
}
</script>
