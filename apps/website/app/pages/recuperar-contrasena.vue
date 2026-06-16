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
            <IconChevronLeft :size="17" :stroke-width="2.2" />
            <span>Ir al inicio</span>
          </NuxtLink>
          <h1 class="auth__form__title title">Recupera tu contraseña</h1>
          <p class="auth__form__description">Introduce tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
          <div class="auth__form__fields">
            <FormForgotPassword />
          </div>
          <div class="auth__form__help">
            <p>
              ¿Tienes una cuenta en
              <strong>Waldo.click®</strong>
              ?
              <NuxtLink to="/login" title="Inicia sesión">
                Inicia sesión
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft as IconChevronLeft } from "lucide-vue-next";

// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

// Components
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormForgotPassword from "@/components/FormForgotPassword.vue";

const title = "Recupera el acceso a tu cuenta en waldo.click®";
const subtitle =
  "Introduce tu correo para recibir un enlace de restablecimiento de contraseña:";
const list = [
  "Recibirás un enlace en tu correo para crear una nueva contraseña.",
  "El enlace solo será válido por un tiempo limitado.",
  "Asegúrate de revisar la carpeta de spam si no lo ves en tu bandeja de entrada.",
];

$setSEO({
  title: "Recuperar Contraseña",
  description:
    "Recupera el acceso a tu cuenta en Waldo.click®. Sigue unos simples pasos para restablecer tu contraseña de forma segura.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/recuperar-contrasena`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Recuperar Contraseña",
  description:
    "Recupera el acceso a tu cuenta en Waldo.click®. Sigue unos simples pasos para restablecer tu contraseña de forma segura.",
  url: `${config.public.baseUrl}/recuperar-contrasena`,
});

definePageMeta({
  middleware: ["guest"],
});
</script>
