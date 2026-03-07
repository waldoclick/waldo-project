<template>
  <!-- Aquí puedes agregar tu template si es necesario -->
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
const { Swal } = useSweetAlert2();

useSeoMeta({ robots: "noindex, nofollow" });

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
      route.query.access_token as string,
    );
    // Redirigir a /anuncios si la autenticación es exitosa
    if (response) {
      router.push("/anuncios");
    }
  } catch (error) {
    const errorMessage =
      (error as any)?.response?.data?.error?.details?.error?.message ||
      "Error desconocido durante la autenticación.";
    Swal.fire("Error", errorMessage, "error");
    router.push("/login");
  }
};

// Llamar a la función de autenticación cuando el componente se monta
authenticate();
</script>
