<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    :initial-values="form"
    validate-on-mount
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
            type="number"
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
            type="number"
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
            type="number"
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
            type="number"
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
      :primary-disabled="!meta.valid"
      @back="handleformBack"
    />
  </Form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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
    .min(0, "El peso no puede ser negativo")
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .test("len", "El peso no puede exceder los 7 caracteres", (value) => {
      if (value === null || value === undefined) return true;
      return String(value).length <= 7;
    }),
  width: yup
    .number()
    .nullable()
    .min(0, "El ancho no puede ser negativo")
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .test("len", "El ancho no puede exceder los 4 caracteres", (value) => {
      if (value === null || value === undefined) return true;
      return String(value).length <= 4;
    }),
  height: yup
    .number()
    .nullable()
    .min(0, "La altura no puede ser negativa")
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .test("len", "La altura no puede exceder los 4 caracteres", (value) => {
      if (value === null || value === undefined) return true;
      return String(value).length <= 4;
    }),
  depth: yup
    .number()
    .nullable()
    .min(0, "La profundidad no puede ser negativa")
    .transform((value, originalValue) => (originalValue === "" ? null : value))
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

const form = ref({
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

// Block non-numeric keys for decimal fields (weight, width, height, depth — decimal allowed)
const handleDecimalKeydown = (event: KeyboardEvent) => {
  const blocked = ["e", "E", "+", "-"];
  if (blocked.includes(event.key)) {
    event.preventDefault();
  }
};

// Sanitize paste/autofill for decimal fields — remove leading minus sign
const handleDecimalInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.value.startsWith("-")) {
    input.value = input.value.replace(/^-+/, "");
    // Trigger Vue reactivity — vee-validate reads from DOM on input event
  }
};

// onMounted: UI-only — loads conditions for select (fire-and-forget; non-critical for SSR)
onMounted(() => {
  conditionsStore.loadConditions();
});
</script>
