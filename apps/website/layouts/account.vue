<template>
  <div class="layout layout--account">
    <HeaderDefault :show-search="false" />
    <MobileBar />
    <HeroFake />
    <div class="layout--account__container">
      <div class="layout--account__sidebar">
        <SidebarAccount />
      </div>
      <div class="layout--account__content">
        <NuxtPage :key="$route.fullPath" />
      </div>
    </div>
    <FooterDefault />
    <LightboxCookies />
    <LightboxAdblock />
  </div>
</template>

<script setup>
import SidebarAccount from "@/components/SidebarAccount";
import HeaderDefault from "@/components/HeaderDefault";
import MobileBar from "@/components/MobileBar.vue";
import FooterDefault from "@/components/FooterDefault";
import HeroFake from "@/components/HeroFake.vue";

import LightboxCookies from "@/components/LightboxCookies.vue";
import LightboxAdblock from "@/components/LightboxAdblock.vue";
</script>
