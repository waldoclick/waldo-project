<template>
  <section class="account account--password">
    <div class="account--edit__header">
      <h1 class="account--edit__title title">Actualiza tu contraseña</h1>
      <div class="account--edit__text paragraph">
        <p>
          Mantén tu cuenta segura actualizando tu contraseña periódicamente. Una
          contraseña fuerte es tu primera línea de defensa. Asegúrate de elegir
          una que sea única y no la uses en otros servicios.
        </p>
      </div>
    </div>
    <div v-if="isExternalProvider" class="account--password__memo">
      <MemoDefault
        :icon="ShieldOff"
        text="No puedes cambiar tu contraseña porque iniciaste sesión con Google u otro proveedor externo."
        link="/cuenta"
        button-text="Volver a mi cuenta"
      />
    </div>
    <div v-else class="account--password__form">
      <FormPassword />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ShieldOff } from "lucide-vue-next";
import FormPassword from "@/components/FormPassword.vue";
import MemoDefault from "@/components/MemoDefault.vue";

const user = useStrapiUser();

const isExternalProvider = computed(() => user.value?.provider !== "local");
</script>
