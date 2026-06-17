<template>
  <section class="account account--password">
    <span class="account--password__eyebrow">Seguridad</span>
    <h1 class="account--password__heading">Cambiar contraseña</h1>
    <p class="account--password__intro">
      Mantén tu cuenta segura. Usa una contraseña única que no utilices en otros servicios.
    </p>

    <div v-if="isExternalProvider" class="account--password__memo">
      <MemoDefault
        :icon="ShieldOff"
        text="No puedes cambiar tu contraseña porque iniciaste sesión con Google u otro proveedor externo."
        link="/cuenta"
        button-text="Volver a mi cuenta"
      />
    </div>
    <div v-else class="account--password__card">
      <FormPassword />
    </div>

    <div v-if="!isExternalProvider" class="account--password__note">
      <Shield class="account--password__note__icon" :size="16" />
      <span class="account--password__note__text">¿Iniciaste sesión con Google? En ese caso tu contraseña se gestiona desde tu proveedor y no podrás cambiarla aquí.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ShieldOff, Shield } from "lucide-vue-next";
import FormPassword from "@/components/FormPassword.vue";
import MemoDefault from "@/components/MemoDefault.vue";

const user = useSessionUser();

const isExternalProvider = computed(() => user.value?.provider !== "local");
</script>
