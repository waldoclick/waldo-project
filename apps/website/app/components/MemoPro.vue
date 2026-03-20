<template>
  <div class="memo memo--pro">
    <Crown :size="40" class="memo--pro__icon" />
    <div class="memo--pro__text">
      <p>
        ¡Potencia tu experiencia en Waldo.click! Por solo $1.000 mensuales,
        accede a funciones exclusivas y destaca tu perfil con una cuenta PRO.
        Únete a nuestra comunidad de usuarios destacados.
      </p>
    </div>
    <button
      class="btn btn--buy"
      title="Hazte PRO"
      @click="handleProSubscription"
    >
      Hazte PRO
    </button>
  </div>
</template>

<script setup>
const { Swal } = useSweetAlert2();
import { Crown } from "lucide-vue-next";

const apiClient = useApiClient();

const handleProSubscription = async () => {
  const result = await Swal.fire({
    title: "Confirmar suscripción PRO",
    text: "¿Está seguro de proceder con la suscripción PRO?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, proceder",
    cancelButtonText: "No, cancelar",
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    const response = await apiClient("payments/pro", {
      method: "POST",
      body: { data: {} },
    });

    // Redirección GET a Transbank Oneclick con TBK_TOKEN en URL
    if (response?.data?.urlWebpay && response?.data?.token) {
      const redirectUrl = `${response.data.urlWebpay}?TBK_TOKEN=${response.data.token}`;
      window.location.href = redirectUrl;
    } else {
      console.error("Respuesta inválida de la API para Oneclick", response);
      Swal.fire(
        "Error",
        "La respuesta de la API no contiene la información necesaria para el pago.",
        "error",
      );
    }
  } catch (error) {
    console.error("Error creating PRO subscription:", error);
    Swal.fire(
      "Error",
      "Hubo un error al procesar la suscripción. Por favor, inténtalo de nuevo.",
      "error",
    );
  }
};
</script>
