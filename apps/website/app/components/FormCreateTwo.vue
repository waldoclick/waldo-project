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
      <h2 class="form__title">¿Qué quieres publicar?</h2>
      <div class="form__description">
        <p>
          Recuerda que una vez creado el anuncio no podrás editar los datos.
        </p>
      </div>
    </div>

    <!-- Título -->
    <div class="form__field">
      <div class="form-group">
        <label class="form-label" for="name">* Título</label>
        <Field
          v-model="form.name"
          name="name"
          type="text"
          class="form-control"
          maxlength="25"
          @input="handleNameInput"
        />
        <ErrorMessage name="name" />
      </div>
    </div>

    <!-- Categoría -->
    <div v-if="categories.length > 0" class="form__field">
      <div class="form-group">
        <label class="form-label" for="category">* Categoría</label>
        <Field
          v-model="form.category"
          as="select"
          name="category"
          class="form-control"
        >
          <option :value="null" disabled>Seleccione una categoría</option>
          <option
            v-for="(item, index) in categories"
            :key="index"
            :value="item.id"
          >
            {{ item.name }}
          </option>
        </Field>
        <ErrorMessage name="category" />
      </div>
    </div>

    <!-- Precio -->
    <div class="form__field">
      <div class="form-group">
        <div class="currency">
          <div class="currency__input">
            <label class="form-label" for="price">* Precio</label>
            <Field
              v-model="form.currency"
              as="select"
              name="currency"
              class="currency__select"
            >
              <option value="CLP">CLP</option>
              <option value="USD">USD</option>
            </Field>
            <Field
              v-model="form.price"
              name="price"
              type="number"
              class="form-control"
              min="0"
              maxlength="10"
              inputmode="numeric"
              @keydown="handlePriceKeydown"
              @input="handlePriceInput"
            />
            <ErrorMessage name="price" />
          </div>
        </div>
      </div>
    </div>

    <!-- Descripción -->
    <div class="form__field">
      <div class="form-group">
        <label class="form-label" for="description">* Descripción</label>
        <Field
          v-model="form.description"
          as="textarea"
          name="description"
          class="form-control"
          @input="handleTextArea"
        />
        <ErrorMessage name="description" />
        <p class="form-msg">{{ remainingChars }} caracteres</p>
      </div>
    </div>

    <BarAnnouncement
      :percentage="25"
      :current-step="step"
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
import { ref, computed, onMounted, watch } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useCategoriesStore } from "@/stores/categories.store";
import { useAdStore } from "~/stores/ad.store";
import { useValidation } from "@/composables/useValidation";
import { useAdPaymentSummary } from "@/composables/useAdPaymentSummary";
import BarAnnouncement from "@/components/BarAnnouncement.vue";

const { isValidText } = useValidation();
const { paymentSummaryText } = useAdPaymentSummary();

// Define las reglas de validación
const schema = yup.object({
  name: yup
    .string()
    .required("El título es requerido")
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(25, "El título debe tener como máximo 25 caracteres")
    .test("is-valid-title", "Título no válido", (value) =>
      isValidText(value || ""),
    ),
  category: yup.string().required("La categoría es requerida"),
  price: yup
    .number()
    .transform((value, originalValue) => {
      // Si el valor original es string vacío, lo convertimos a null
      return originalValue === "" ? null : value;
    })
    .required("El precio es requerido")
    .positive("El precio debe ser mayor a 0")
    .max(9999999999, "El precio no puede exceder los 10 dígitos"),
  currency: yup.string().required("La moneda es requerida"),
  description: yup
    .string()
    .required("La descripción es requerida")
    .test("is-valid-description", "Descripción no válida", (value) =>
      isValidText(value || ""),
    ),
});

const adStore = useAdStore();
const categoriesStore = useCategoriesStore();
const step = computed(() => adStore.step);

const form = ref<{
  name: string;
  category: number | string;
  price: number | string;
  currency: string;
  description: string;
}>({
  name: "",
  category: adStore.ad.category || "",
  price: adStore.ad.price || "",
  currency: adStore.ad.currency || "CLP",
  description: adStore.ad.description || "",
});

const maxChars = 300;

// Computed property for remaining characters
const remainingChars = computed(() => {
  return maxChars - form.value.description.length;
});

// Handle text area input
const handleTextArea = () => {
  if (form.value.description.length > maxChars) {
    form.value.description = form.value.description.slice(0, maxChars);
  }
};

// Handle name input
const handleNameInput = () => {
  if (form.value.name.length > 40) {
    form.value.name = form.value.name.slice(0, 40);
  }
};

// Handle price input — sanitizes paste/autofill edge cases
const handlePriceInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // Remove any non-digit characters (handles paste/autofill edge cases)
  const sanitized = input.value.replace(/\D/g, "");
  if (sanitized === "") {
    form.value.price = "";
  } else {
    const numeric = Number(sanitized);
    form.value.price = numeric > 9999999999 ? 9999999999 : numeric;
  }
};

// Block non-numeric keys: e, E, +, -, . (price is integer-only)
const handlePriceKeydown = (event: KeyboardEvent) => {
  const blocked = ["e", "E", "+", "-", "."];
  if (blocked.includes(event.key)) {
    event.preventDefault();
  }
};

// Computed para obtener categorías
const categories = computed(() => categoriesStore.categories);

// onMounted: UI-only — initializes form from adStore state; categories pre-loaded by parent page
onMounted(() => {
  form.value.name = adStore.ad.name || "";
  form.value.category = adStore.ad.category || "";
  form.value.price = adStore.ad.price || 0;
  form.value.currency = adStore.ad.currency || "CLP";
  form.value.description = adStore.ad.description || "";
});

// Watch para actualizar el formulario si cambia el store
watch(
  () => adStore.ad,
  (newAd) => {
    form.value.price = newAd.price || 0;
    form.value.currency = newAd.currency || "CLP";
    form.value.name = newAd.name || "";
    form.value.category = newAd.category || "";
    form.value.description = newAd.description || "";
  },
);

const emit = defineEmits(["formSubmitted", "formBack"]);

// Manejo del envío del formulario
const handleSubmit = async (values: Record<string, unknown>) => {
  adStore.updateName(values.name as string);
  adStore.updateCategory(values.category as number);
  adStore.updatePrice(values.price as number);
  adStore.updateCurrency(values.currency as string);
  adStore.updateDescription(values.description as string);
  // avanzar
  emit("formSubmitted", values);
};

const handleformBack = async () => {
  emit("formBack");
};
</script>
