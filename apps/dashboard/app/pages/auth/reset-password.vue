<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="page.data.title" :list="page.data.list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
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

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
});
</script>
