<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <!-- <pre>{{ list }}</pre> -->
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <h1 class="auth__form__title title">Ingresa a tu cuenta</h1>
          <div class="auth__form__fields">
            <FormLogin />
          </div>
          <div class="auth__form__help">
            <p>
              ¿Olvidaste tu contraseña?
              <NuxtLink to="/auth/forgot-password" title="Recupérala aquí">
                Recupérala aquí
              </NuxtLink>
            </p>
            <p>
              ¿Necesitas acceso? Contacta a un administrador en
              <a href="mailto:contacto@waldo.click" title="Contactar soporte">
                contacto@waldo.click
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormLogin from "@/components/FormLogin.vue";

const title = "Panel de administración de waldo.click®";
const subtitle = "Esta es una zona de acceso restringido.";
const list = [
  "El acceso está habilitado exclusivamente para administradores autorizados.",
  "Si necesitas acceder y no tienes credenciales, contacta a un administrador.",
  "¿Problemas para ingresar? Escríbenos a contacto@waldo.click",
];

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
});
</script>
