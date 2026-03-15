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

    <BarAnnouncement
      :percentage="100"
      :current-step="5"
      :total-steps="5"
      :show-steps="true"
      :summary-text="paymentSummaryText"
      primary-label="Continuar"
      :primary-disabled="isButtonDisabled"
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
import { useAdPaymentSummary } from "@/composables/useAdPaymentSummary";
import BarAnnouncement from "@/components/BarAnnouncement.vue";

import { useAdStore } from "@/stores/ad.store";
import { usePendingUploads } from "@/composables/usePendingUploads";

const emit = defineEmits(["formSubmitted", "formBack"]);

// Importar useAdStore
const adStore = useAdStore(); // Inicializar adStore
const { paymentSummaryText } = useAdPaymentSummary();
const { pendingGalleryItems } = usePendingUploads();

// Define las reglas de validación
const schema = yup.object({});
const totalImages = computed(
  () => adStore.ad.gallery.length + pendingGalleryItems.value.length,
);
const isButtonDisabled = computed(() => totalImages.value === 0);

// Manejo del envío del formulario
const handleSubmit = async (values) => {
  if (totalImages.value === 0) {
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
