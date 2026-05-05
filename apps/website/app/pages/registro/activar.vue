<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <h1 class="auth__form__title title">{{ pageTitle }}</h1>
          <div class="auth__form__description">{{ pageDescription }}</div>
          <NuxtLink
            v-if="status === 'success'"
            to="/login"
            class="btn btn--block btn--primary"
            title="Iniciar sesión"
          >
            Iniciar sesión
          </NuxtLink>
          <NuxtLink
            v-if="status === 'error'"
            to="/registro"
            class="btn btn--block btn--secondary"
            title="Volver al registro"
          >
            Volver al registro
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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

const status = ref<"loading" | "success" | "error">("loading");

const pageTitle = computed(() => {
  if (status.value === "success") return "¡Correo confirmado!";
  if (status.value === "error") return "Error al confirmar";
  return "Confirmando tu cuenta...";
});

const pageDescription = computed(() => {
  if (status.value === "success")
    return "Tu cuenta ha sido activada. Ya puedes iniciar sesión.";
  if (status.value === "error")
    return "El enlace es inválido o ya fue utilizado. Solicita un nuevo correo de confirmación desde el login.";
  return "Estamos verificando tu correo electrónico. Un momento por favor.";
});

onMounted(async () => {
  const confirmation = route.query.confirmation as string | undefined;

  if (!confirmation) {
    status.value = "error";
    Swal.fire(
      "Enlace inválido",
      "No se encontró un token de confirmación en el enlace.",
      "error",
    );
    return;
  }

  try {
    await apiClient(`/auth/email-confirmation?confirmation=${confirmation}`, {
      method: "GET",
    });
    status.value = "success";
    await Swal.fire(
      "¡Cuenta confirmada!",
      "Tu correo electrónico ha sido verificado. Ya puedes iniciar sesión.",
      "success",
    );
    navigateTo("/login");
  } catch {
    status.value = "error";
    Swal.fire(
      "Error al confirmar",
      "El enlace es inválido o ya fue utilizado. Solicita un nuevo correo de confirmación.",
      "error",
    );
  }
});
</script>
