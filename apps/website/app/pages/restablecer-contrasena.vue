<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="page.data.title" :list="page.data.list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <NuxtLink to="/" class="auth__form__back" title="Ir al inicio">
            <IconChevronLeft :size="17" :stroke-width="2.2" />
            <span>Ir al inicio</span>
          </NuxtLink>
          <h2 class="auth__form__title title">Restablece tu contraseña</h2>
          <p class="auth__form__description">Elige una contraseña nueva y segura para tu cuenta. No podrás reutilizar la anterior.</p>
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
import { ChevronLeft as IconChevronLeft } from "lucide-vue-next";
import { useNuxtApp } from "#app";

// Components
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormResetPassword from "@/components/FormResetPassword.vue";

// Define SEO y structured data
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

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

// Set SEO
$setSEO({
  title: "Restablecer Contraseña",
  description:
    "Estás en el último paso para recuperar el acceso a tu cuenta en Waldo.click®. Ingresa tu nueva contraseña para completar el proceso.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/restablecer-contrasena`,
});
useSeoMeta({ robots: "noindex, nofollow" });

// Set Structured Data
$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Restablecer Contraseña",
  description:
    "Estás en el último paso para recuperar el acceso a tu cuenta en Waldo.click®. Ingresa tu nueva contraseña para completar el proceso.",
  url: `${config.public.baseUrl}/restablecer-contrasena`,
});

definePageMeta({
  middleware: ["guest"],
});
</script>
