<template>
  <section class="account account--edit" aria-labelledby="profile-edit-title">
    <div class="account--edit__header">
      <h1 id="profile-edit-title" class="account--edit__title title">
        Completa tu perfil
      </h1>
      <div class="account--edit__text paragraph">
        <p>
          ¡Haz que tu perfil brille! Completa tu información personal para que
          otros usuarios puedan conocerte mejor. Cuanto más completa esté tu
          información, más confianza generarás en la comunidad de Waldo.click®.
        </p>
      </div>
    </div>
    <div class="account--edit__form" aria-describedby="profile-edit-title">
      <FormProfile />
    </div>
  </section>
</template>

<script setup>
import FormProfile from "@/components/FormProfile.vue";
</script>
