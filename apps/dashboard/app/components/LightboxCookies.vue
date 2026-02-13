<template>
  <div :class="{ 'is-open': isOpen }" class="lightbox lightbox--cookies">
    <button
      title="Cerrar mensaje"
      type="button"
      class="lightbox__button"
      @click="closeLightbox"
    >
      <IconX :size="24" />
    </button>
    <div class="lightbox--cookies__content">
      <div class="lightbox--cookies__title">Este sitio web usa cookies</div>
      <div class="lightbox--cookies__text">
        Utilizamos cookies para personalizar contenido, analizar nuestro tráfico
        y ofrecer una mejor experiencia en nuestro sitio. Al hacer clic en
        'Aceptar', otorgas tu consentimiento para el uso de cookies relacionadas
        con almacenamiento publicitario y analítico. Para más detalles, consulta
        nuestra Política de Privacidad.
      </div>
      <div class="lightbox--cookies__buttons">
        <button
          class="btn btn--primary btn--block"
          title="Aceptar"
          @click="acceptCookies"
        >
          Aceptar
        </button>
        <nuxt-link
          to="/politicas-de-privacidad"
          class="btn btn--secondary btn--block"
          title="Más información"
        >
          Más información
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { X as IconX } from "lucide-vue-next";

const { $cookies } = useNuxtApp();

const isOpen = ref(false);
const cookieName = "site-cookies-accepted";

onMounted(() => {
  const cookieAccepted = $cookies.get(cookieName);
  if (!cookieAccepted) {
    isOpen.value = true;
  }
});

function closeLightbox() {
  isOpen.value = false;
  acceptCookies();
}

function acceptCookies() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "accept_cookies",
    consent: {
      ad_storage: "granted",
      analytics_storage: "granted",
    },
  });

  $cookies.set(cookieName, true, {
    path: "/",
    expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expira en 1 año
  });

  isOpen.value = false;
}
</script>
