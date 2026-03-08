<template>
  <Form v-slot="{ meta }" class="form form--checkout" @submit="handleSubmit">
    <!-- Introduce -->
    <div class="form--checkout__field">
      <h2 class="form--checkout__field__title">Confirma tu pago</h2>
      <div class="form--checkout__field__description">
        <p>
          Revisa los detalles de tu anuncio, elige cómo quieres publicarlo y
          completa el pago de forma segura.
        </p>
      </div>
    </div>

    <!-- Anuncio -->
    <div class="form--checkout__field">
      <h3 class="form--checkout__field__title">Tu anuncio</h3>
      <PaymentAd />
    </div>

    <!-- Tipo de publicación -->
    <div class="form--checkout__field">
      <h3 class="form--checkout__field__title">Tipo de publicación</h3>
      <PaymentMethod />
    </div>

    <!-- Destacado -->
    <div class="form--checkout__field">
      <h3 class="form--checkout__field__title">Destacado</h3>
      <PaymentFeatured />
    </div>

    <!-- Boleta o factura -->
    <div class="form--checkout__field">
      <h3 class="form--checkout__field__title">Boleta o factura</h3>
      <PaymentInvoice />
    </div>

    <!-- Pasarela de pago -->
    <div class="form--checkout__field">
      <h3 class="form--checkout__field__title">Pasarela de pago</h3>
      <PaymentGateway />
    </div>

    <BarCheckout
      :percentage="100"
      :current-step="1"
      :total-steps="5"
      :show-steps="true"
      :summary-text="paymentSummaryText"
      primary-label="Ir a pagar"
      :primary-disabled="!meta.valid"
      :show-back="false"
    />
  </Form>
</template>

<script setup lang="ts">
import { Form } from "vee-validate";
import { useAdPaymentSummary } from "@/composables/useAdPaymentSummary";

const emit = defineEmits(["formSubmitted"]);
const { paymentSummaryText } = useAdPaymentSummary();

const handleSubmit = (values: Record<string, unknown>) => {
  emit("formSubmitted", values);
};
</script>
