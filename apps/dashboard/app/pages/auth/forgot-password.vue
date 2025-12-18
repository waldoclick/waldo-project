<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <!-- <pre>{{ list }}</pre> -->
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <NuxtLink to="/" class="auth__form__back" title="Ir al inicio">
            <img
              loading="lazy"
              decoding="async"
              :src="mobileMenuClose"
              alt="mobile menu close"
              title="mobile menu close"
            />
            <span>Ir al inicio</span>
          </NuxtLink>
          <h1 class="auth__form__title title">Recupera tu contraseña</h1>
          <div class="auth__form__fields">
            <FormForgotPassword />
          </div>
          <div class="auth__form__help">
            <p>
              ¿Tienes una cuenta en
              <strong>Waldo.click®</strong>
              ?
              <NuxtLink to="/auth/login" title="Inicia sesión">
                Inicia sesión
              </NuxtLink>
            </p>
            <!-- <p>
              ¿Olvidaste tu contraseña?
              <NuxtLink to="/auth/forgot-password" title="Recupérala aquí">
                Recupérala aquí
              </NuxtLink>
            </p> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Components
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormForgotPassword from "@/components/FormForgotPassword.vue";

// Import the image
import mobileMenuClose from "/images/mobile-menu-close.svg";

const title = "Recupera el acceso a tu cuenta en waldo.click®";
const subtitle =
  "Introduce tu correo para recibir un enlace de restablecimiento de contraseña:";
const list = [
  "Recibirás un enlace en tu correo para crear una nueva contraseña.",
  "El enlace solo será válido por un tiempo limitado.",
  "Asegúrate de revisar la carpeta de spam si no lo ves en tu bandeja de entrada.",
];

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
});
</script>
