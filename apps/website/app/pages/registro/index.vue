<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <!-- <pre>{{ list }}</pre> -->
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <AuthMobileHeader />
          <NuxtLink to="/" class="auth__form__back" title="Ir al inicio">
            <IconChevronLeft :size="17" :stroke-width="2.2" />
            <span>Ir al inicio</span>
          </NuxtLink>
          <h1 class="auth__form__title title">Crea tu cuenta</h1>
          <p class="auth__form__description">
            Empieza gratis · 3 anuncios incluidos
          </p>
          <div
            v-if="providers?.google /* || providers?.facebook */"
            class="auth__form__social"
          >
            <LoginWithGoogle v-if="providers?.google" />
            <!-- <LoginWithFacebook v-if="providers?.facebook" /> -->
          </div>
          <div
            v-if="providers?.google /* || providers?.facebook */"
            class="auth__form__separator"
          >
            o con tus datos
          </div>
          <div class="auth__form__fields">
            <FormRegister />
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

// Verificar proveedores de autenticación usando el plugin de Strapi (sin apiUrl en cliente)
const { data: providers } = await useAsyncData("providers", async () => {
  const { getProviderAuthenticationUrl } = useSessionAuth();
  try {
    const googleUrl = getProviderAuthenticationUrl("google");
    return {
      google: !!googleUrl,
    };
  } catch {
    return {
      google: true,
    };
  }
});

// Components
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormRegister from "@/components/FormRegister.vue";
import LoginWithGoogle from "@/components/LoginWithGoogle.vue";
// import LoginWithFacebook from "@/components/LoginWithFacebook.vue";
import { ChevronLeft as IconChevronLeft } from "lucide-vue-next";

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
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/registro`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Regístrate",
  description:
    "Crea tu cuenta en Waldo.click® y comienza a comprar y vender activos industriales de manera rápida y sencilla.",
  url: `${config.public.baseUrl}/registro`,
});

definePageMeta({
  middleware: ["guest"],
});
</script>
