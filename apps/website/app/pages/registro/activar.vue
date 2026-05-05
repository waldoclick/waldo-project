<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <h1 class="auth__form__title title">Confirmando tu cuenta...</h1>
          <div class="auth__form__description">
            Estamos verificando tu correo electrónico. Un momento por favor.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import IntroduceAuth from "@/components/IntroduceAuth.vue";

definePageMeta({
  layout: "auth",
});

useSeoMeta({ robots: "noindex, nofollow" });

const title = "Crea tu cuenta en waldo.click®";
const subtitle = "Con tu cuenta en waldo.click® podrás:";
const list = [
  "Ver los datos de contacto de los anuncios.",
  "Publicar anuncios con nuestros planes disponibles.",
  "Disfrutar de hasta 3 anuncios gratis renovables.",
  "Recibir notificaciones de nuevos anuncios en tu correo periódicamente.",
];

const route = useRoute();
const apiClient = useApiClient();
const { Swal } = useSweetAlert2();

onMounted(async () => {
  const confirmation = route.query.confirmation as string | undefined;

  if (!confirmation) {
    await Swal.fire(
      "Enlace inválido",
      "No se encontró un token de confirmación en el enlace.",
      "error",
    );
    navigateTo("/registro");
    return;
  }

  try {
    await apiClient(`/auth/email-confirmation?confirmation=${confirmation}`, {
      method: "GET",
    });
    await Swal.fire(
      "¡Cuenta confirmada!",
      "Tu correo electrónico ha sido verificado. Ya puedes iniciar sesión.",
      "success",
    );
    navigateTo("/login");
  } catch {
    await Swal.fire(
      "Error al confirmar",
      "El enlace es inválido o ya fue utilizado. Solicita un nuevo correo de confirmación.",
      "error",
    );
  }
});
</script>
