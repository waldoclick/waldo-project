<template>
  <div class="layout layout--default">
    <slot />
    <MobileBar />
    <LightboxRegister />
    <LightboxCookies />
    <LightboxAdblock />
    <LightboxSearch />
    <LightboxLogin />
  </div>
</template>

<script setup lang="ts">
import MobileBar from "@/components/MobileBar.vue";
import LightboxRegister from "@/components/LightboxRegister.vue";
import LightboxCookies from "@/components/LightboxCookies.vue";
import LightboxAdblock from "@/components/LightboxAdblock.vue";
import LightboxSearch from "@/components/LightboxSearch.vue";
import LightboxLogin from "@/components/LightboxLogin.vue";

// Google One Tap - todo manejado en el composable
// const { initializeGoogleOneTap } = useGoogleOneTap();

// onMounted(() => {
//   initializeGoogleOneTap();
// });
</script>
