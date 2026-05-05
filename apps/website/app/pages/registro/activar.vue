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

type ConfirmationResult = { ok: true } | { resent: true } | { error: true };

const confirmation = route.query.confirmation as string | undefined;

const { data } = await useAsyncData<ConfirmationResult>(
  "activar-email-confirmation",
  async () => {
    if (!confirmation) {
      return { error: true };
    }
    try {
      const res = await apiClient<{ ok?: boolean; resent?: boolean }>(
        `/auth/email-confirmation?confirmation=${confirmation}`,
        { method: "GET" },
      );
      if (res?.resent) return { resent: true };
      return { ok: true };
    } catch {
      return { error: true };
    }
  },
  { default: (): ConfirmationResult => ({ error: true }) },
);

onMounted(async () => {
  const result = data.value;

  if (result && "ok" in result) {
    await Swal.fire(
      "¡Cuenta confirmada!",
      "Tu correo electrónico ha sido verificado. Ya puedes iniciar sesión.",
      "success",
    );
  } else if (result && "resent" in result) {
    await Swal.fire(
      "Te hemos enviado un nuevo correo",
      "El enlace anterior ya había sido utilizado. Revisa tu correo electrónico para confirmar tu cuenta.",
      "info",
    );
  } else {
    await Swal.fire(
      "Enlace inválido",
      "El enlace es inválido o ha expirado. Solicita un nuevo correo de confirmación.",
      "error",
    );
  }

  await navigateTo("/login");
});
</script>
