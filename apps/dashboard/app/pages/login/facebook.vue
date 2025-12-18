<template>
  <!-- Aquí puedes agregar tu template si es necesario -->
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
const { Swal } = useSweetAlert2();

// Obtener la función authenticateProvider de useStrapiAuth
const { authenticateProvider } = useStrapiAuth();

// Obtener la ruta y el router
const route = useRoute();
const router = useRouter();

const authenticate = async () => {
  try {
    // Autenticar al usuario con facebook utilizando el token de acceso de la URL
    const response = await authenticateProvider(
      "facebook",
      route.query.access_token,
    );
    // Redirigir al index del dashboard si la autenticación es exitosa
    if (response) {
      router.push("/");
    }
  } catch (error) {
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
