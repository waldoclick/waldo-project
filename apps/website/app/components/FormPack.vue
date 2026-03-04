<template>
  <Form
    v-slot="{ meta }"
    :validation-schema="schema"
    class="form form--create"
    @submit="handleSubmit"
  >
    <!-- Introduce -->
    <div class="form__field">
      <h2 class="form__title">
        Compra un pack y ahorra en la <br />publicación de tus anuncios.
      </h2>
      <div class="form__description">
        <p>
          Elige el pack que mejor se ajuste a tus necesidades y obtén beneficios
          <br />adicionales. Compra ahora y utiliza tus anuncios cuando lo
          necesites.
        </p>
      </div>
    </div>

    <!-- Tipos de pack -->
    <div class="form__field">
      <PackMethod />
      <PackInvoice />
    </div>

    <BarPacks
      :summary-text="packSummaryText"
      primary-label="Ir a pagar"
      :primary-disabled="!meta.valid"
      @primary="handleSubmit"
      @back="() => $router.push('/packs')"
    />
  </Form>
</template>

<script setup>
import { Form } from "vee-validate";
const { Swal } = useSweetAlert2();
import { useNuxtApp } from "#app";
import PackMethod from "@/components/PackMethod.vue";
import PackInvoice from "@/components/PackInvoice.vue";
import BarPacks from "@/components/BarPacks.vue";
import { usePackStore } from "@/stores/pack.store";
import { usePackPaymentSummary } from "@/composables/usePackPaymentSummary";

const { create } = useStrapi();
const { $recaptcha } = useNuxtApp();

const packStore = usePackStore();
const emit = defineEmits(["formSubmitted"]);
const { summaryText: packSummaryText } = usePackPaymentSummary();

const handleSubmit = async (values) => {
  const result = await Swal.fire({
    title: "Confirmar pago",
    text: "¿Está seguro de proceder al pago de la compra del pack?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, proceder",
    cancelButtonText: "No, cancelar",
  });

  if (!result.isConfirmed) {
    return;
  }

  const packId = packStore.pack;
  const isInvoice = packStore.is_invoice;

  try {
    // Execute reCAPTCHA v3
    const token = await $recaptcha.execute("submit");

    const allData = {
      pack: packId,
      is_invoice: isInvoice,
      recaptchaToken: token,
    };

    const response = await create("payments/pack", allData);
    handleRedirect(response.data.webpay);
  } catch (error) {
    console.error("Error creating payment:", error);
    Swal.fire(
      "Error",
      "Hubo un error al procesar el pago. Por favor, inténtalo de nuevo.",
      "error",
    );
  }
};

const handleRedirect = (response) => {
  // Crear un formulario dinámicamente
  const form = document.createElement("form");
  form.method = "POST";
  form.action = response.url;

  // Crear un campo de entrada para el token
  const tokenField = document.createElement("input");
  tokenField.type = "hidden";
  tokenField.name = "token_ws";
  tokenField.value = response.gatewayRef;
  form.appendChild(tokenField);

  // Añadir el formulario al cuerpo del documento y enviarlo
  document.body.appendChild(form);
  form.submit();
};
</script>
