<template>
  <div class="reminder reminder--default">
    <span class="reminder--default__icon">
      <Lock :size="21" />
    </span>
    <h3 class="reminder--default__title">Datos de contacto protegidos</h3>
    <p class="reminder--default__text">
      Inicia sesión o regístrate gratis para ver el correo, el teléfono y
      escribir al vendedor.
    </p>
    <nuxt-link
      :to="{ name: 'login' }"
      title="Iniciar sesión"
      class="reminder--default__login"
    >
      <LogIn :size="17" />
      Iniciar sesión
    </nuxt-link>
    <nuxt-link
      :to="{ name: 'registro' }"
      title="Crear cuenta gratis"
      class="reminder--default__register"
    >
      Crear cuenta gratis
    </nuxt-link>
    <span v-if="props.verified" class="reminder--default__verified">
      <Check :size="13" />
      Anunciante verificado por Waldo
    </span>
  </div>
</template>

<script setup>
import { Lock, LogIn, Check } from "lucide-vue-next";

const props = defineProps({
  verified: {
    type: Boolean,
    default: false,
  },
});
</script>
