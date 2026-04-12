<template>
  <!-- Aquí puedes agregar tu template si es necesario -->
  <div class="page page--provider">
    <LoadingDefault />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
const { Swal } = useSweetAlert2();
import { useAppStore } from "@/stores/app.store";
import { useMeStore } from "@/stores/me.store";
import LoadingDefault from "@/components/LoadingDefault.vue";
import { useLogger } from "@/composables/useLogger";

useSeoMeta({ robots: "noindex, nofollow" });

// Obtener la función authenticateProvider de useStrapiAuth
const { authenticateProvider } = useStrapiAuth();
// Obtener la ruta y el router
const route = useRoute();
const appStore = useAppStore();
const meStore = useMeStore();
const { logInfo } = useLogger();
const { login } = useAdAnalytics();

const authenticate = async () => {
  try {
    // Autenticar al usuario con Google utilizando el token de acceso de la URL
    const response = await authenticateProvider(
      "google",
      String(route.query.access_token || ""),
    );
    // Redirigir a /anuncios si la autenticación es exitosa
    if (response) {
      // Log successful Google login
      logInfo(`User logged in successfully with Google.`);
      login("google");

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
  } catch (error: unknown) {
    // Mostrar el mensaje de error y redirigir a /login
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
      err.response?.data?.error?.details?.error?.message ||
      "Error desconocido durante la autenticación.";
    Swal.fire("Error", errorMessage, "error");
    await navigateTo("/login");
  }
};

// Llamar a la función de autenticación cuando el componente se monta
authenticate();
</script>
