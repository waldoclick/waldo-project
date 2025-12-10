<template>
  <Form v-slot="{ meta }" class="form form--create" @submit="handleSubmit">
    <!-- Introduce -->
    <div class="form__field">
      <h2 class="form__title">¿Cómo quieres publicar tu anuncio?</h2>
      <div class="form__description">
        <p>
          Elige la forma como quieres publicar, si tienes anuncios úsalos, si no
          tienes compra uno individual o un Pack, a todos los puedes adjuntar un
          destacado.
        </p>
      </div>
    </div>

    <!-- Tipos de anuncio -->
    <div class="form__field">
      <PaymentMethod />
      <PaymentFeatured />
      <PaymentInvoice />
    </div>

    <BarCreate
      :percentage="0"
      :current-step="1"
      :total-steps="5"
      :is-valid="meta.valid"
      :is-back-disabled="true"
      @submit="handleSubmit"
      @back="handleformBack"
    />
  </Form>
</template>

<script setup>
import { Form } from "vee-validate";
import PaymentMethod from "@/components/PaymentMethod.vue";
import PaymentFeatured from "@/components/PaymentFeatured.vue";
import PaymentInvoice from "@/components/PaymentInvoice.vue";
import BarCreate from "@/components/BarCreate.vue";

const emit = defineEmits(["formSubmitted"]);

const handleSubmit = async (values) => {
  // Emitir el evento 'formSubmitted'
  emit("formSubmitted", values);
};

const handleformBack = async () => {
  emit("formBack");
};
</script>
