<template>
  <div class="layout layout--auth">
    <slot />
    <LightboxCookies />
    <LightboxAdblock />
    <LightboxTerms />
  </div>
</template>

<script setup lang="ts">
import LightboxCookies from "@/components/LightboxCookies.vue";
import LightboxAdblock from "@/components/LightboxAdblock.vue";
import LightboxTerms from "@/components/LightboxTerms.vue";
</script>
