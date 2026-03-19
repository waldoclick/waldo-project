<template>
  <div class="onboarding onboarding--default">
    <div class="onboarding--default__container">
      <div class="onboarding--default__logo">
        <LogoBlack />
      </div>
      <h1 class="onboarding--default__title">Bienvenido a Waldo.click®</h1>
      <p class="onboarding--default__text">
        Completa tu perfil para comenzar a publicar y gestionar tus avisos.
      </p>
      <div class="onboarding--default__form">
        <FormProfile :onboarding-mode="true" @success="handleSuccess" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ success: [] }>();
const handleSuccess = () => emit("success");
</script>
