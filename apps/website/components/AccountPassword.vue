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
    <div class="account--password__form">
      <FormPassword />
    </div>
  </section>
</template>

<script setup>
import FormPassword from "@/components/FormPassword.vue";
</script>
