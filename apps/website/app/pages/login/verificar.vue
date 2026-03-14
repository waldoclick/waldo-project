<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <NuxtLink
            to="/login"
            class="auth__form__back"
            title="Volver al inicio de sesión"
          >
            <img
              loading="lazy"
              decoding="async"
              :src="mobileMenuClose"
              alt="volver"
              title="volver"
            />
            <span>Volver</span>
          </NuxtLink>
          <h1 class="auth__form__title title">Verificación en dos pasos</h1>
          <div class="auth__form__fields">
            <FormVerifyCode ref="formRef" />
          </div>
          <div class="auth__form__help">
            <p>
              ¿No recibiste el código?
              <button
                :disabled="resendDisabled || resending"
                type="button"
                class="auth__form__help__link"
                @click="handleResend"
              >
                <span v-if="resendCooldown > 0"
                  >Reenviar en {{ resendCooldown }}s</span
                >
                <span v-else-if="resending">Reenviando...</span>
                <span v-else>Haz clic aquí para reenviarlo</span>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormVerifyCode from "@/components/FormVerifyCode.vue";
import mobileMenuClose from "/images/mobile-menu-close.svg";

definePageMeta({
  layout: "auth",
});

const title = "Accede y gestiona tus anuncios en waldo.click®";
const subtitle = "Con tu cuenta en waldo.click® podrás:";
const list = [
  "Ver los datos de contacto de los anuncios.",
  "Publicar anuncios con nuestros planes disponibles.",
  "Disfrutar de hasta 3 anuncios gratis renovables.",
  "Recibir notificaciones de nuevos anuncios en tu correo periódicamente.",
];

const formRef = ref(null);

const resendCooldown = computed(() => formRef.value?.resendCooldown ?? 60);
const resendDisabled = computed(() => (resendCooldown.value ?? 0) > 0);
const resending = computed(() => formRef.value?.resending ?? false);

const handleResend = () => formRef.value?.handleResend();
</script>
