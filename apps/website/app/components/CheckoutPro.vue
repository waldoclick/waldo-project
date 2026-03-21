<template>
  <section class="checkout checkout--pro">
    <div class="checkout--pro__container">
      <ClientOnly>
        <FormPro
          @form-submitted="handleFormSubmitted"
          @update:is-invoice="
            (val: boolean) => {
              isInvoice = val;
            }
          "
        />
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FormPro from "@/components/FormPro.vue";
import type { User } from "@/types/user";

const { Swal } = useSweetAlert2();
const apiClient = useApiClient();

const isInvoice = ref(false);

const handleFormSubmitted = async () => {
  const result = await Swal.fire({
    title: "Estas seguro?",
    text: "Se procedera con la suscripcion PRO mensual.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Si, proceder al pago",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;

  try {
    const response = await apiClient<{
      data: { urlWebpay?: string; token?: string };
    }>("payments/pro", {
      method: "POST",
      body: { data: { is_invoice: isInvoice.value } },
    });

    if (response?.data?.urlWebpay && response?.data?.token) {
      // Oneclick uses GET redirect — NOT POST form like Webpay Plus
      window.location.href = `${response.data.urlWebpay}?TBK_TOKEN=${response.data.token}`;
    } else {
      Swal.fire(
        "Error",
        "La respuesta de la API no contiene la informacion necesaria para el pago.",
        "error",
      );
    }
  } catch (error) {
    console.error("Error creating PRO subscription:", error);
    Swal.fire(
      "Error",
      "Hubo un error al procesar la suscripcion. Por favor, intentalo de nuevo.",
      "error",
    );
  }
};
</script>
