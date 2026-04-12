<template>
  <!-- Aquí puedes agregar tu template si es necesario -->
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useAppStore } from "@/stores/app.store";
import { useMeStore } from "@/stores/me.store";
const { Swal } = useSweetAlert2();

useSeoMeta({ robots: "noindex, nofollow" });

// Obtener la función authenticateProvider de useStrapiAuth
const { authenticateProvider } = useStrapiAuth();

// Obtener la ruta
const route = useRoute();
const meStore = useMeStore();
const appStore = useAppStore();

const authenticate = async () => {
  try {
    // Autenticar al usuario con facebook utilizando el token de acceso de la URL
    const response = await authenticateProvider(
      "facebook",
      route.query.access_token as string,
    );
    // Redirigir a /anuncios si la autenticación es exitosa
    if (response) {
      // Clear stale cache so isProfileComplete() fetches fresh data from the API.
      meStore.reset();
      const isComplete = await meStore.isProfileComplete();

      // Decide destination before the navigation — same rationale as FormVerifyCode:
      // avoid relying on the guard to intercept (race / same-route no-op risk).
      if (!isComplete) {
        await navigateTo("/onboarding");
        return;
      }

      const redirectTo = appStore.getReferer || "/anuncios";
      appStore.clearReferer();
      await navigateTo(redirectTo);
    }
  } catch (error) {
    const err = error as {
      response?: {
        data?: {
          error?: {
            details?: { error?: { message?: string }; message?: string };
          };
        };
      };
    };
    const errorMessage =
      err?.response?.data?.error?.details?.error?.message ||
      "Error desconocido durante la autenticación.";
    Swal.fire("Error", errorMessage, "error");
    await navigateTo("/login");
  }
};

// Llamar a la función de autenticación cuando el componente se monta
authenticate();
</script>
