<template>
  <!-- Aquí puedes agregar tu template si es necesario -->
  <div class="page page--provider">
    <LoadingDefault />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
const { Swal } = useSweetAlert2();
import LoadingDefault from "@/components/LoadingDefault.vue";
import { useLogger } from "@/composables/useLogger";

// Obtener la función authenticateProvider de useStrapiAuth
const { authenticateProvider } = useStrapiAuth();
// Obtener la ruta y el router
const route = useRoute();
const router = useRouter();
const { logInfo } = useLogger();

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

      // Redirigir al index del dashboard
      router.push("/");
    }
  } catch (error: any) {
    // Mostrar el mensaje de error y redirigir a /login
    const errorMessage =
      error.response?.data?.error?.details?.error?.message ||
      "Error desconocido durante la autenticación.";
    Swal.fire("Error", errorMessage, "error");
    router.push("/login");
  }
};

// Llamar a la función de autenticación cuando el componente se monta
authenticate();
</script>
