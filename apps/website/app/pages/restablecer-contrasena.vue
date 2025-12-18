<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="page.data.title" :list="page.data.list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <NuxtLink to="/" class="auth__form__back" title="Ir al inicio">
            <img
              loading="lazy"
              decoding="async"
              :src="mobileMenuCloseSrc"
              alt="Cerrar menú móvil"
              title="Cerrar menú móvil"
            />
            <span>Ir al inicio</span>
          </NuxtLink>
          <h2 class="auth__form__title title">Restablece tu contraseña</h2>
          <div class="auth__form__fields">
            <FormResetPassword />
          </div>
          <div class="auth__form__help">
            <p>
              ¿Ya tienes una cuenta?
              <NuxtLink to="/login" title="Iniciar sesión">
                Inicia sesión
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useNuxtApp } from "#app";

// Components
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormResetPassword from "@/components/FormResetPassword.vue";

// Importar la imagen
import mobileMenuClose from "/images/mobile-menu-close.svg";

// Define SEO y structured data
const { $setSEO, $setStructuredData } = useNuxtApp();

// Página de datos
const page = {
  data: {
    title: "Restablece tu contraseña",
    list: [
      "Completa el formulario",
      "Crea una nueva contraseña segura",
      "Accede nuevamente a tu cuenta",
    ],
  },
};

// Ruta de la imagen
const mobileMenuCloseSrc = mobileMenuClose;

// Set SEO
$setSEO({
  title: "Restablecer Contraseña",
  description:
    "Estás en el último paso para recuperar el acceso a tu cuenta en Waldo.click®. Ingresa tu nueva contraseña para completar el proceso.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/restablecer-contrasena",
});

// Set Structured Data
$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Restablecer Contraseña",
  description:
    "Estás en el último paso para recuperar el acceso a tu cuenta en Waldo.click®. Ingresa tu nueva contraseña para completar el proceso.",
  url: "https://waldo.click/restablecer-contrasena",
});

definePageMeta({
  middleware: ["guest"],
});
</script>
