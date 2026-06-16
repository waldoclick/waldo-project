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
          <h1 class="auth__form__title title">Ingresa a tu cuenta</h1>
          <p class="auth__form__description">Bienvenido de vuelta a Waldo.click®</p>
          <div class="auth__form__social">
            <LoginWithGoogle v-if="providers?.google" />
            <!-- <LoginWithFacebook v-if="providers?.facebook" /> -->
            <div v-if="providersPending" class="auth__form__loading">
              <p>Cargando opciones de inicio de sesión...</p>
            </div>
          </div>
          <div
            v-if="providers?.google /* || providers?.facebook */"
            class="auth__form__separator"
          >
            o con tu correo
          </div>
          <div class="auth__form__fields">
            <FormLogin />
          </div>
          <div class="auth__form__help">
            <p>
              ¿No tienes cuenta en
              <strong>Waldo.click®</strong>
              ?
              <NuxtLink to="/registro" title="Crea una cuenta gratis">
                Crea una cuenta gratis
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
import { useAsyncData } from "nuxt/app";
import { ChevronLeft as IconChevronLeft } from "lucide-vue-next";
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormLogin from "@/components/FormLogin.vue";
import LoginWithGoogle from "@/components/LoginWithGoogle.vue";
// import LoginWithFacebook from "@/components/LoginWithFacebook.vue";

// Obtener la configuración de runtime
const config = useRuntimeConfig();

// Verificar proveedores de autenticación usando el plugin de Strapi
const { data: providers, pending: providersPending } = useLazyAsyncData(
  "providers",
  async () => {
    const { getProviderAuthenticationUrl } = useSessionAuth();

    try {
      // Intentar obtener la URL de autenticación de Google
      const googleUrl = getProviderAuthenticationUrl("google");
      // const facebookUrl = getProviderAuthenticationUrl("facebook");

      return {
        google: !!googleUrl,
        // facebook: !!facebookUrl,
      };
    } catch (error) {
      console.warn("Error checking providers:", error);
      // En caso de error, asumir que Google está disponible
      return {
        google: true,
        // facebook: false,
      };
    }
  },
  {
    // Valor por defecto mientras se carga
    default: () => ({
      google: true,
      // facebook: false,
    }),
  },
);

const title = "Accede y gestiona tus anuncios en waldo.click®";
const subtitle = "Con tu cuenta en waldo.click® podrás:";
const list = [
  "Ver los datos de contacto de los anuncios.",
  "Publicar anuncios con nuestros planes disponibles.",
  "Disfrutar de hasta 3 anuncios gratis renovables.",
  "Recibir notificaciones de nuevos anuncios en tu correo periódicamente.",
];

// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

$setSEO({
  title: "Iniciar sesión",
  description:
    "Accede a tu cuenta en Waldo.click® para gestionar tus anuncios, ver contactos y disfrutar de todos los beneficios de nuestra plataforma.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Iniciar sesión",
  description:
    "Accede a tu cuenta en Waldo.click® para gestionar tus anuncios, ver contactos y disfrutar de todos los beneficios de nuestra plataforma.",
  url: `${config.public.baseUrl}/login`,
});

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
});
</script>
