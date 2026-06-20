<template>
  <div class="layout layout--about">
    <HeaderDefault />
    <MobileBar />

    <HeroDefault
      v-if="title"
      :breadcrumbs="[{ label: title }]"
      :title="title"
      :subtitle="intro"
    />

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
import HeaderDefault from "@/components/HeaderDefault.vue";
import MobileBar from "@/components/MobileBar.vue";
import HeroDefault from "@/components/HeroDefault.vue";
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
