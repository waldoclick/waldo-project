<template>
  <div class="layout layout--auth">
    <slot />
    <LightboxCookiesDashboard />
    <LightboxAdblockDashboard />
  </div>
</template>

<script setup lang="ts">
import LightboxCookies from "@/components/LightboxCookies.vue";
import LightboxAdblock from "@/components/LightboxAdblock.vue";

// Google One Tap - todo manejado en el composable
// const { initializeGoogleOneTap } = useGoogleOneTap();

// onMounted(() => {
//   initializeGoogleOneTap();
// });
</script>
