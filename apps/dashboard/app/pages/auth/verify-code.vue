<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <h1 class="auth__form__title title">Verificación en dos pasos</h1>
          <div class="auth__form__description">
            Hemos enviado un código de 6 dígitos a tu correo electrónico.
            Ingrésalo a continuación para continuar.
          </div>
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
                <span v-if="resendCooldown > 0">
                  Reenviar en {{ resendCooldown }}s
                </span>
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

<script setup lang="ts">
import { ref, computed } from "vue";
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormVerifyCode from "@/components/FormVerifyCode.vue";

definePageMeta({
  layout: "auth",
});

const title = "Verifica tu identidad en waldo.click®";
const subtitle = "Con la verificación en dos pasos podrás:";
const list = [
  "Proteger tu cuenta con un código de un solo uso.",
  "Asegurarte de que solo tú puedes acceder.",
  "Confirmar tu identidad de forma rápida y segura.",
];

const formRef = ref<InstanceType<typeof FormVerifyCode> | null>(null);

const resendCooldown = computed(() => formRef.value?.resendCooldown ?? 60);
const resendDisabled = computed(() => (resendCooldown.value ?? 0) > 0);
const resending = computed(() => formRef.value?.resending ?? false);

const handleResend = () => formRef.value?.handleResend();
</script>
