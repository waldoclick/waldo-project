<template>
  <div class="onboarding onboarding--default">
    <div class="onboarding--default__logo">
      <LogoBlack />
    </div>
    <div class="onboarding--default__form">
      <FormProfile :onboarding-mode="true" @success="handleSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ success: [] }>();
const handleSuccess = () => emit("success");
</script>
