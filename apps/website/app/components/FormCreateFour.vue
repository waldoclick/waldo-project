<template>
  <Form
    :validation-schema="schema"
    :initial-values="form"
    class="form form--create"
    @submit="handleSubmit"
  >
    <!-- Introduce -->
    <div class="form__field">
      <h2 class="form__title">Completa la ficha de tu producto</h2>
      <div class="form__description">
        <p>
          Estarás mejor ubicado en los resultados de búsqueda y los compradores
          tendrán la información para comprar tu equipo.
        </p>
      </div>
    </div>

    <div class="form__grid">
      <!-- Condición -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="condition">* Condición</label>
          <Field
            v-model="form.condition"
            as="select"
            name="condition"
            class="form-control"
          >
            <option :value="null" disabled>Seleccione una condición</option>
            <option
              v-for="(item, index) in conditions"
              :key="index"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </Field>
          <ErrorMessage name="condition" />
        </div>
      </div>

      <!-- Fabricante -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="manufacturer">Fabricante</label>
          <Field
            v-model="form.manufacturer"
            name="manufacturer"
            type="text"
            class="form-control"
            maxlength="20"
          />
          <ErrorMessage name="manufacturer" />
        </div>
      </div>
    </div>

    <div class="form__grid form__grid--3">
      <!-- Modelo -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="model">Modelo</label>
          <Field
            v-model="form.model"
            name="model"
            type="text"
            class="form-control"
            maxlength="20"
          />
          <ErrorMessage name="model" />
        </div>
      </div>

      <!-- Número de Serie -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="serial_number">Número de Serie</label>
          <Field
            v-model="form.serial_number"
            name="serial_number"
            type="text"
            class="form-control"
            maxlength="30"
          />
          <ErrorMessage name="serial_number" />
        </div>
      </div>

      <!-- Año -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="year">Año</label>
          <Field
            v-model="form.year"
            name="year"
            type="number"
            class="form-control"
            min="0"
            maxlength="4"
            inputmode="numeric"
            @keydown="handleIntegerKeydown"
            @input="handleYearInput"
          />
          <ErrorMessage name="year" />
        </div>
      </div>
    </div>

    <div class="form__grid form__grid--4">
      <!-- Peso -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="weight">Peso (kg)</label>
          <Field
            v-model="form.weight"
            name="weight"
            type="text"
            class="form-control"
            min="0"
            maxlength="7"
            inputmode="decimal"
            @keydown="handleDecimalKeydown"
            @input="handleDecimalInput"
          />
          <ErrorMessage name="weight" />
        </div>
      </div>

      <!-- Ancho -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="width">Ancho (m)</label>
          <Field
            v-model="form.width"
            name="width"
            type="text"
            class="form-control"
            min="0"
            maxlength="4"
            inputmode="decimal"
            @keydown="handleDecimalKeydown"
            @input="handleDecimalInput"
          />
          <ErrorMessage name="width" />
        </div>
      </div>

      <!-- Altura -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="height">Altura (m)</label>
          <Field
            v-model="form.height"
            name="height"
            type="text"
            class="form-control"
            min="0"
            maxlength="4"
            inputmode="decimal"
            @keydown="handleDecimalKeydown"
            @input="handleDecimalInput"
          />
          <ErrorMessage name="height" />
        </div>
      </div>

      <!-- Profundidad -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="depth">Profundidad (m)</label>
          <Field
            v-model="form.depth"
            name="depth"
            type="text"
            class="form-control"
            min="0"
            maxlength="4"
            inputmode="decimal"
            @keydown="handleDecimalKeydown"
            @input="handleDecimalInput"
          />
          <ErrorMessage name="depth" />
        </div>
      </div>
    </div>

    <BarAnnouncement
      :percentage="75"
      :current-step="4"
      :total-steps="5"
      :show-steps="true"
      :summary-text="paymentSummaryText"
      primary-label="Continuar"
      :primary-disabled="!isFormValid"
      @back="handleformBack"
    />
  </Form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useAdStore } from "@/stores/ad.store";
import { useConditionsStore } from "~/stores/conditions.store";
import { useValidation } from "@/composables/useValidation";
import { useAdPaymentSummary } from "@/composables/useAdPaymentSummary";
import BarAnnouncement from "@/components/BarAnnouncement.vue";

const emit = defineEmits(["formSubmitted", "formBack"]);
const { paymentSummaryText } = useAdPaymentSummary();

const { isValidText } = useValidation();

// Chilean/Spanish keyboards type decimals with a comma (e.g. "3,4"). The
// weight/width/height/depth fields are type="text" so that character can be
// typed at all, so normalization happens here — at validation/cast time —
// rather than by fighting vee-validate's own value tracking in an input
// handler. Empty values become null (fields are optional); non-numeric input
// becomes NaN, which yup's own number-type validation reports via typeError.
const parseDecimalInput = (originalValue: unknown): number | null => {
  if (
    originalValue === "" ||
    originalValue === null ||
    originalValue === undefined
  ) {
    return null;
  }
  return Number(String(originalValue).replace(/,/g, "."));
};

// Define las reglas de validación
const schema = yup.object({
  condition: yup.string().required("La condición es requerida"),
  manufacturer: yup
    .string()
    .nullable()
    .max(20, "El fabricante no puede exceder los 20 caracteres")
    .test("is-valid-manufacturer", "Fabricante no válido", (value) =>
      isValidText(value || ""),
    ),
  model: yup
    .string()
    .nullable()
    .max(20, "El modelo no puede exceder los 20 caracteres"),
  year: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null) return null;
      return Number(originalValue);
    })
    .nullable()
    .min(0, "El año no puede ser negativo")
    .integer("El año debe ser un número entero")
    .max(
      new Date().getFullYear(),
      `El año no puede ser mayor a ${new Date().getFullYear()}`,
    )
    .test("len", "El año debe tener como máximo 4 dígitos", (value) => {
      if (value === null || value === undefined) return true;
      return String(value).length <= 4;
    }),
  serial_number: yup
    .string()
    .nullable()
    .max(30, "El número de serie no puede exceder los 30 caracteres"),
  weight: yup
    .number()
    .nullable()
    .typeError("El peso debe ser un número válido")
    .transform((_value, originalValue) => parseDecimalInput(originalValue))
    .min(0, "El peso no puede ser negativo")
    .test("len", "El peso no puede exceder los 7 caracteres", (value) => {
      if (value === null || value === undefined) return true;
      return String(value).length <= 7;
    }),
  width: yup
    .number()
    .nullable()
    .typeError("El ancho debe ser un número válido")
    .transform((_value, originalValue) => parseDecimalInput(originalValue))
    .min(0, "El ancho no puede ser negativo")
    .test("len", "El ancho no puede exceder los 4 caracteres", (value) => {
      if (value === null || value === undefined) return true;
      return String(value).length <= 4;
    }),
  height: yup
    .number()
    .nullable()
    .typeError("La altura debe ser un número válido")
    .transform((_value, originalValue) => parseDecimalInput(originalValue))
    .min(0, "La altura no puede ser negativa")
    .test("len", "La altura no puede exceder los 4 caracteres", (value) => {
      if (value === null || value === undefined) return true;
      return String(value).length <= 4;
    }),
  depth: yup
    .number()
    .nullable()
    .typeError("La profundidad debe ser un número válido")
    .transform((_value, originalValue) => parseDecimalInput(originalValue))
    .min(0, "La profundidad no puede ser negativa")
    .test(
      "len",
      "La profundidad no puede exceder los 4 caracteres",
      (value) => {
        if (value === null || value === undefined) return true;
        return String(value).length <= 4;
      },
    ),
});

const adStore = useAdStore();
const conditionsStore = useConditionsStore();

// weight/width/height/depth accept `string` too: handleDecimalInput sanitizes
// as the user types, and mid-edit values like "10." (trailing separator, more
// digits still to come) must survive without being forced into a Number
// early. The yup schema casts the final string to a number at validation time.
interface FormFour {
  condition: number | null;
  manufacturer: string;
  model: string;
  serial_number: string;
  year: number;
  weight: number | string;
  width: number | string;
  height: number | string;
  depth: number | string;
}

const form = ref<FormFour>({
  condition: adStore.ad.condition || null,
  manufacturer: adStore.ad.manufacturer || "",
  model: adStore.ad.model || "",
  serial_number: adStore.ad.serial_number || "",
  year: adStore.ad.year || 0,
  weight: adStore.ad.weight || 0,
  width: adStore.ad.width || 0,
  height: adStore.ad.height || 0,
  depth: adStore.ad.depth || 0,
});

const conditions = computed(() => conditionsStore.conditions);

// Drives the "Continuar" button without forcing on-mount validation
// (vee-validate now only shows field errors after user interaction)
const isFormValid = ref(false);
watch(
  form,
  async (value) => {
    isFormValid.value = await schema.isValid(value);
  },
  { deep: true, immediate: true },
);

const handleSubmit = async (values: Record<string, unknown>) => {
  adStore.updateCondition(values.condition as number | null);
  adStore.updateManufacturer(values.manufacturer as string);
  adStore.updateModel(values.model as string);
  adStore.updateYear(values.year as number);
  adStore.updateSerialNumber(values.serial_number as string);
  adStore.updateWeight(values.weight as number);
  adStore.updateWidth(values.width as number);
  adStore.updateHeight(values.height as number);
  adStore.updateDepth(values.depth as number);

  emit("formSubmitted", values);
};

const handleformBack = async () => {
  emit("formBack");
};

// Block non-numeric keys for integer fields (year — no decimals allowed)
const handleIntegerKeydown = (event: KeyboardEvent) => {
  const blocked = ["e", "E", "+", "-", "."];
  if (blocked.includes(event.key)) {
    event.preventDefault();
  }
};

// Sanitize paste/autofill for the year field — integer only, no decimals
const handleYearInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const sanitized = input.value.replace(/\D/g, "");
  input.value = sanitized;
  form.value.year = sanitized === "" ? 0 : Number(sanitized);
};

// These fields are type="text" (not type="number") so a comma can be typed at
// all — Chilean/Spanish keyboards produce "," for decimals, and native number
// inputs reject that character outright. Being type="text" means the browser
// no longer blocks letters/symbols on its own, so this keydown handler is an
// ALLOWLIST (digits, navigation/editing keys, and a single decimal separator),
// not just a blocklist — the previous version only blocked "e/E/+/-" and
// relied on the browser to reject everything else, which stopped being true
// once the input type changed.
const DECIMAL_NAV_KEYS = new Set([
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Tab",
  "Home",
  "End",
]);
const handleDecimalKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (DECIMAL_NAV_KEYS.has(event.key)) return;
  if (/^\d$/.test(event.key)) return;
  if (event.key === "." || event.key === ",") {
    const input = event.target as HTMLInputElement;
    if (!input.value.includes(".") && !input.value.includes(",")) return;
  }
  event.preventDefault();
};

// Strips anything that isn't a digit or a decimal separator, and normalizes
// "," to ".". Catches what keydown can't: paste and autofill/QA-tool fills,
// which set the value programmatically without dispatching per-key keydown
// events. Trailing separators (e.g. "10.") are preserved as-is so the user
// can keep typing digits after them — only the yup schema casts to a final
// number, at validation time.
const sanitizeDecimalString = (raw: string): string => {
  // Keep digits and BOTH possible decimal separators — Chile uses "," and
  // that's what the field should keep showing the user typed it; only the
  // yup schema (parseDecimalInput) normalizes to a dot, for the underlying
  // JS number, which is never shown back to the user.
  const stripped = raw.replace(/[^\d,.]/g, "");
  const firstSeparator = stripped.match(/[,.]/);
  if (!firstSeparator || firstSeparator.index === undefined) return stripped;
  const sepIndex = firstSeparator.index;
  const sep = stripped[sepIndex];
  const integerPart = stripped.slice(0, sepIndex);
  const decimalPart = stripped.slice(sepIndex + 1).replace(/[,.]/g, "");
  return `${integerPart}${sep}${decimalPart}`;
};

// IMPORTANT: only ever assign to the reactive form ref here — never mutate
// event.target.value directly, and never assign synchronously.
// vee-validate's <Field> tracks the native input's value internally and
// writes it back on the SAME "input" event dispatch, AFTER this handler
// starts running — so a synchronous v-model reassignment (with or without
// also touching the DOM directly) gets immediately overwritten by that
// internal write, and the sanitized value never reaches the screen (verified
// empirically: both approaches left "10,5"/"Pariatu" on screen unchanged,
// including via vee-validate's own setFieldValue API). Deferring the
// assignment past a tick lets Field's own write happen first, so the
// sanitized value applies last and actually sticks.
const handleDecimalInput = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const fieldName = input.name as "weight" | "width" | "height" | "depth";
  const sanitized = sanitizeDecimalString(input.value);
  await nextTick();
  form.value[fieldName] = sanitized;
};

// onMounted: UI-only — loads conditions for select (fire-and-forget; non-critical for SSR)
onMounted(() => {
  conditionsStore.loadConditions();
});
</script>
