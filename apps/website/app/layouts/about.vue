<template>
  <div class="layout layout--about">
    <HeaderDefault />
    <MobileBar />

    <section class="layout--about__header">
      <span class="layout--about__header__glow" aria-hidden="true"></span>
      <div class="layout--about__header__inner">
        <nav class="layout--about__header__crumbs" aria-label="Ruta de navegación">
          <nuxt-link to="/" class="layout--about__header__crumbs__home">Waldo</nuxt-link>
          <ChevronRight class="layout--about__header__crumbs__sep" aria-hidden="true" />
          <span class="layout--about__header__crumbs__current">{{ title }}</span>
        </nav>
        <h1 class="layout--about__header__title">{{ title }}</h1>
        <p v-if="intro" class="layout--about__header__intro">{{ intro }}</p>
      </div>
    </section>

    <section class="layout--about__container">
      <aside class="layout--about__sidebar">
        <MenuAbout :active="active" />
      </aside>
      <div class="layout--about__content">
        <slot />
      </div>
    </section>

    <WhyCta />

    <FooterDefault />
    <LightboxSearch />
    <LightboxLogin />
    <LightboxRegister />
    <LightboxCookies />
    <LightboxAdblock />
    <LightboxTerms />
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";

import HeaderDefault from "@/components/HeaderDefault.vue";
import MobileBar from "@/components/MobileBar.vue";
import MenuAbout from "@/components/MenuAbout.vue";
import WhyCta from "@/components/WhyCta.vue";
import FooterDefault from "@/components/FooterDefault.vue";

import LightboxSearch from "@/components/LightboxSearch.vue";
import LightboxLogin from "@/components/LightboxLogin.vue";
import LightboxRegister from "@/components/LightboxRegister.vue";
import LightboxCookies from "@/components/LightboxCookies.vue";
import LightboxAdblock from "@/components/LightboxAdblock.vue";
import LightboxTerms from "@/components/LightboxTerms.vue";

defineProps<{
  title: string;
  intro?: string;
  active: string;
}>();
</script>
