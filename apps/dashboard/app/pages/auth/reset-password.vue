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
              <NuxtLink to="/auth/login" title="Iniciar sesión">
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
// Components
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormResetPassword from "@/components/FormResetPassword.vue";

// Importar la imagen
import mobileMenuClose from "/images/mobile-menu-close.svg";

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

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
});
</script>
