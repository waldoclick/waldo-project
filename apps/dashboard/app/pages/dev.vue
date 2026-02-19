<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <h1 class="auth__form__title title">Acceso Restringido</h1>
          <div class="auth__form__fields">
            <FormDev />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormDev from "@/components/FormDev.vue";

const title = "Acceso Restringido<br>Modo Desarrollo";
const subtitle =
  "El dashboard está en mantenimiento.<br>Para continuar necesitas autenticarte:";
const list = [
  "El acceso al dashboard está restringido temporalmente.",
  "Solo usuarios autorizados pueden acceder.",
  "Contacta al administrador si necesitas acceso.",
];

definePageMeta({
  layout: "auth",
});
</script>
