<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <h1 class="auth__form__title title">Verificación en dos pasos</h1>
          <div class="auth__form__fields">
            <FormVerifyCode />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormVerifyCode from "@/components/FormVerifyCode.vue";

definePageMeta({
  layout: "auth",
});

const title = "Verifica tu identidad en waldo.click®";
const subtitle = "Hemos enviado un código de verificación a tu correo:";
const list = [
  "Ingresa el código de 6 dígitos que recibiste por correo.",
  "El código es válido por 5 minutos.",
  "Si no lo ves, revisa tu carpeta de spam.",
  "Puedes solicitar un nuevo código después de 60 segundos.",
];
</script>
