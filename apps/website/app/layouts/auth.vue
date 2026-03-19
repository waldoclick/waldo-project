<template>
  <div class="layout layout--auth">
    <slot />
    <LightboxCookies />
    <LightboxAdblock />
  </div>
</template>

<script setup lang="ts">
import LightboxCookies from "@/components/LightboxCookies.vue";
import LightboxAdblock from "@/components/LightboxAdblock.vue";
</script>
