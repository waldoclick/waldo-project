<template>
  <div class="layout layout--about">
    <HeaderDefault />
    <MobileBar />
    <HeroFake />
    <div class="layout--about__container">
      <div class="layout--about__sidebar">
        <MenuAbout />
      </div>
      <div class="layout--about__content">
        <slot />
      </div>
    </div>
    <FooterDefault />
    <LightboxRegister />
    <LightboxCookies />
    <LightboxAdblock />
  </div>
</template>

<script setup>
import HeaderDefault from "@/components/HeaderDefault.vue";
import MobileBar from "@/components/MobileBar.vue";
import HeroFake from "@/components/HeroFake.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import MenuAbout from "@/components/MenuAbout.vue";

import LightboxRegister from "@/components/LightboxRegister.vue";
import LightboxCookies from "@/components/LightboxCookies.vue";
import LightboxAdblock from "@/components/LightboxAdblock.vue";
</script>
