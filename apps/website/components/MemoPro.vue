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
import { useNuxtApp } from "#app";
const { Swal } = useSweetAlert2();
import { Crown } from "lucide-vue-next";

const { create } = useStrapi();

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
    const { data } = await create("payments/pro", {});

    // Redirección GET a Flow con token en URL
    if (data?.url && data?.token) {
      const redirectUrl = `${data.url}?token=${data.token}`;
      window.location.href = redirectUrl;
    } else {
      console.error("Respuesta inválida de la API para Flow", data);
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
