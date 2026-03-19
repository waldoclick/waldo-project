<template>
  <div class="page">
    <OnboardingThankyou />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "onboarding",
  middleware: "auth",
});

useSeoMeta({ robots: "noindex, nofollow" });
</script>
