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
          <h1 class="auth__form__title title">Crea tu cuenta</h1>
          <div class="auth__form__fields">
            <FormRegister />
          </div>
          <div
            v-if="providers?.google /* || providers?.facebook */"
            class="auth__form__separator"
          >
            o
          </div>
          <div class="auth__form__social">
            <LoginWithGoogle v-if="providers?.google" />
            <!-- <LoginWithFacebook v-if="providers?.facebook" /> -->
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
            <p>
              ¿Olvidaste tu contraseña?
              <NuxtLink to="/recuperar-contrasena" title="Recupérala aquí">
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
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

// Verificar proveedores de autenticación
const { data: providers } = await useAsyncData("providers", async () => {
  const googleResponse = await fetch(`${apiUrl}/api/connect/google/callback`);
  // const facebookResponse = await fetch(
  //   `${apiUrl}/api/connect/facebook/callback`,
  // );

  return {
    google: Number(googleResponse.status) === 200,
    // facebook: Number(facebookResponse.status) === 200,
  };
});

// Components
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormRegister from "@/components/FormRegister.vue";
import LoginWithGoogle from "@/components/LoginWithGoogle.vue";
// import LoginWithFacebook from "@/components/LoginWithFacebook.vue";

// Import the image
import mobileMenuClose from "/images/mobile-menu-close.svg";

const title = "Regístrate y empieza a gestionar tus anuncios en waldo.click®";
const subtitle = "Al crear tu cuenta en waldo.click® podrás:";
const list = [
  "Ver los datos de contacto de los anuncios.",
  "Publicar anuncios con nuestros planes disponibles.",
  "Disfrutar de hasta 3 anuncios gratis renovables.",
  "Recibir notificaciones de nuevos anuncios en tu correo.",
];

$setSEO({
  title: "Regístrate",
  description:
    "Crea tu cuenta en Waldo.click® y comienza a comprar y vender activos industriales de manera rápida y sencilla.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/registro",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Regístrate",
  description:
    "Crea tu cuenta en Waldo.click® y comienza a comprar y vender activos industriales de manera rápida y sencilla.",
  url: "https://waldo.click/registro",
});

definePageMeta({
  middleware: ["guest"],
});
</script>
