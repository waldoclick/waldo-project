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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormLogin from "@/components/FormLogin.vue";

// Import the image
import mobileMenuClose from "/images/mobile-menu-close.svg";

const title = "Accede y gestiona tus anuncios en waldo.click®";
const subtitle = "Con tu cuenta en waldo.click® podrás:";
const list = [
  "Ver los datos de contacto de los anuncios.",
  "Publicar anuncios con nuestros planes disponibles.",
  "Disfrutar de hasta 3 anuncios gratis renovables.",
  "Recibir notificaciones de nuevos anuncios en tu correo periódicamente.",
];

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
});
</script>
