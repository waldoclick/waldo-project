<template>
  <Form
    :validation-schema="schema"
    class="form form--create"
    @submit="handleSubmit"
  >
    <!-- Introduce -->
    <div class="form__field">
      <h2 class="form__title">Añade imágenes a tu anuncio</h2>
      <div class="form__description">
        <p>
          Las imágenes son clave para destacar tu anuncio. Elige fotos claras y
          relevantes que muestren lo que ofreces.
        </p>
      </div>
    </div>

    <div class="form__field">
      <UploadImages />
    </div>

    <BarCreate
      :percentage="100"
      :current-step="5"
      :total-steps="5"
      :is-valid="true"
      :is-submit-disabled="isButtonDisabled"
      @submit="handleSubmit"
      @back="handleformBack"
    />
  </Form>
</template>

<script setup>
import { computed } from "vue";
import { Form } from "vee-validate";
import * as yup from "yup";
const { Swal } = useSweetAlert2();

import UploadImages from "@/components/UploadImages.vue";
import BarCreate from "@/components/BarCreate.vue";

import { useAdStore } from "@/stores/ad.store";

const emit = defineEmits(["formSubmitted", "formBack"]);

// Importar useAdStore
const adStore = useAdStore(); // Inicializar adStore

// Define las reglas de validación
const schema = yup.object({});
const isButtonDisabled = computed(() => adStore.ad.gallery.length === 0);

// Manejo del envío del formulario
const handleSubmit = async (values) => {
  if (adStore.ad.gallery.length === 0) {
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debes añadir al menos una imagen a tu anuncio.",
    });
    return;
  }

  emit("formSubmitted", values);
};

const handleformBack = async () => {
  emit("formBack");
};
</script>
