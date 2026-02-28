<template>
  <div
    class="lightbox lightbox--login"
    :class="{ 'is-open': isLoginLightboxActive }"
  >
    <div class="lightbox--login__backdrop" @click="handleCloseLightbox" />
    <div class="lightbox--login__box">
      <button
        title="Cerrar"
        type="button"
        class="lightbox__button"
        @click="handleCloseLightbox"
      >
        <IconX :size="24" class="icon-close" />
      </button>
      <h2 class="lightbox--login__title">Iniciar sesión</h2>
      <FormLogin />
      <div v-if="providers?.google" class="lightbox--login__separator">o</div>
      <div v-if="providers?.google" class="lightbox--login__social">
        <LoginWithGoogle />
        <div v-if="providersPending" class="lightbox--login__social-loading">
          <p>Cargando opciones de inicio de sesión...</p>
        </div>
      </div>
      <div class="lightbox--login__help">
        <p>
          ¿No tienes cuenta?
          <NuxtLink
            to="/registro"
            title="Crea una cuenta gratis"
            @click="handleCloseLightbox"
          >
            Crea una cuenta gratis
          </NuxtLink>
        </p>
        <p>
          ¿Olvidaste tu contraseña?
          <NuxtLink
            to="/recuperar-contrasena"
            title="Recupérala aquí"
            @click="handleCloseLightbox"
          >
            Recupérala aquí
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import FormLogin from "@/components/FormLogin.vue";
import LoginWithGoogle from "@/components/LoginWithGoogle.vue";
import { useAppStore } from "@/stores/app.store";
import { X as IconX } from "lucide-vue-next";

const appStore = useAppStore();

const { data: providers, pending: providersPending } = useLazyAsyncData(
  "providers",
  async () => {
    const { getProviderAuthenticationUrl } = useStrapiAuth();
    try {
      const googleUrl = getProviderAuthenticationUrl("google");
      return { google: !!googleUrl };
    } catch {
      return { google: true };
    }
  },
  { default: () => ({ google: true }) },
);

const user = useStrapiUser();
const isLoginLightboxActive = computed(
  () => appStore.isLoginLightboxActive && !user.value,
);

const handleCloseLightbox = () => {
  appStore.closeLoginLightbox();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isLoginLightboxActive.value) {
    handleCloseLightbox();
  }
};

onMounted(() => {
  if (user.value) {
    appStore.closeLoginLightbox();
  }
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
