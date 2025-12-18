<template>
  <section class="account account--edit">
    <div class="account--edit__header">
      <h1 class="account--edit__title title">Elige tu nombre de usuario</h1>
      <div class="account--edit__text paragraph">
        <p>
          Tu nombre de usuario es tu identidad en Waldo.click®. Elige uno que
          sea fácil de recordar y que represente bien tu actividad o negocio.
          Recuerda que una vez que lo cambies, no podrás modificarlo por 90
          días.
        </p>
      </div>
    </div>
    <div class="account--edit__form">
      <FormUsername />
    </div>
  </section>
</template>

<script setup>
import FormUsername from "@/components/FormUsername.vue";
</script>
