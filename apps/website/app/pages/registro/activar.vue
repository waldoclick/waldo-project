<template>
  <div class="page page--provider">
    <LoadingDefault />
  </div>
</template>

<script setup lang="ts">
import LoadingDefault from "@/components/LoadingDefault.vue";

useSeoMeta({ robots: "noindex, nofollow" });

const route = useRoute();
const apiClient = useApiClient();
const { Swal } = useSweetAlert2();

const confirm = async () => {
  const confirmation = route.query.confirmation as string | undefined;

  if (!confirmation) {
    Swal.fire(
      "Enlace inválido",
      "No se encontró un token de confirmación en el enlace.",
      "error",
    );
    await navigateTo("/login");
    return;
  }

  try {
    await apiClient(`/auth/email-confirmation?confirmation=${confirmation}`, {
      method: "GET",
    });
    Swal.fire(
      "¡Cuenta confirmada!",
      "Tu correo electrónico ha sido verificado. Ya puedes iniciar sesión.",
      "success",
    );
  } catch {
    Swal.fire(
      "Error al confirmar",
      "El enlace es inválido o ya fue utilizado. Solicita un nuevo correo de confirmación.",
      "error",
    );
  }

  await navigateTo("/login");
};

confirm();
</script>
