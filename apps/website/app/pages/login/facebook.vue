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
      // Clear any stale cache from a previous session so the global
      // onboarding-guard re-fetches /users/me on the next navigation.
      meStore.reset();

      // Use referer if stored, otherwise fall back to /anuncios
      const redirectTo = appStore.getReferer || "/anuncios";
      appStore.clearReferer();

      // Use navigateTo (not Vue Router's push) so the Nuxt middleware pipeline
      // runs cleanly — the global onboarding-guard.global.ts will intercept
      // this navigation and redirect to /onboarding if the profile is incomplete.
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
