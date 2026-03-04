<template>
  <div class="bar bar--resume">
    <div class="bar--resume__percent"></div>
    <div class="container container--fluid">
      <div class="bar--resume__container">
        <NuxtLink to="/anunciar?step=5" class="btn btn--secondary btn--block">
          <span>Volver</span>
        </NuxtLink>

        <div class="bar--resume__actions">
          <SummaryDefault :text="paymentSummaryText" />

          <button
            type="button"
            class="btn btn--primary btn--block"
            :title="primaryButtonLabel"
            @click="confirmPay"
          >
            <span>{{ primaryButtonLabel }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
const { Swal } = useSweetAlert2();
import { useAdStore } from "@/stores/ad.store";
import { useAdAnalytics } from "@/composables/useAdAnalytics";
import { useAdPaymentSummary } from "@/composables/useAdPaymentSummary";
import SummaryDefault from "@/components/SummaryDefault.vue";

const { create } = useStrapi();
const { fetchUser } = useStrapiAuth();

const router = useRouter();
const adStore = useAdStore();
const adAnalytics = useAdAnalytics();

const { totalAmount, hasToPay, paymentSummaryText } = useAdPaymentSummary();

const primaryButtonLabel = computed(() =>
  hasToPay.value ? "Ir a pagar" : "Crear aviso",
);

const swalCopy = computed(() => {
  if (hasToPay.value) {
    return {
      title: "¿Estás seguro?",
      text: "Tras realizar el pago, no será posible modificar el aviso.",
      confirm: "Sí, proceder al pago",
    };
  }

  return {
    title: "¿Quieres crear el aviso?",
    text: "Una vez creado el aviso, no podrás modificarlo.",
    confirm: "Sí, crear el aviso",
  };
});

// Función intermedia para confirmar el pago
const confirmPay = async () => {
  const result = await Swal.fire({
    title: swalCopy.value.title,
    text: swalCopy.value.text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: swalCopy.value.confirm,
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    handlePayClick();
  }
};

// Método para manejar el click en "Ir a pagar"
const handlePayClick = async () => {
  const allData = {
    pack: adStore.pack,
    featured: adStore.featured,
    is_invoice: adStore.is_invoice,
    ad: adStore.ad,
  };

  try {
    // Enviar evento de add_payment_info antes de procesar el pago
    adAnalytics.addPaymentInfo(allData);

    const response = await create("payments/ad", allData);

    if (response.data && response.data.webpay) {
      // Get ad_id from response and update store if exists
      const ad_id = response.data.ad?.id;
      if (ad_id) {
        adStore.updateAdId(ad_id);
      }
      handleRedirect(response.data.webpay);
    } else {
      // If no webpay, refresh user data and redirect to success page
      await fetchUser();
      router.push("/anunciar/gracias?ad=" + response.data.ad?.id);
    }
  } catch (error) {
    let errorMessage =
      "Hubo un problema al procesar el pago. Por favor, inténtalo de nuevo.";

    if (
      error.response?.data?.message === "No free featured credits available" ||
      error.message === "No free featured credits available"
    ) {
      errorMessage = "No tienes créditos destacados gratuitos disponibles";
    }

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Aceptar",
    });
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
