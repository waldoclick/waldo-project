<template>
  <section class="sitemap sitemap--default">
    <div class="sitemap--default__container">
      <h1 class="sitemap--default__title title">Mapa del sitio</h1>
      <div class="sitemap--default__content">
        <div
          v-for="(block, index) in blocks"
          :key="index"
          class="sitemap--default__content__block"
        >
          <h2>{{ block.title }}</h2>
          <ul class="sitemap--default__content__block__list">
            <li v-for="(item, itemIndex) in block.items" :key="itemIndex">
              <nuxt-link :to="item.to">
                <component :is="item.icon" :size="16" />
                <span>{{ item.label }}</span>
              </nuxt-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FunctionalComponent } from "vue";
import {
  Home as IconHome,
  Megaphone as IconMegaphone,
  Mail as IconMail,
  LogIn as IconLogIn,
  Package as IconPackage,
  Shield as IconShield,
  HelpCircle as IconHelpCircle,
  KeyRound as IconKeyRound,
  UserPlus as IconUserPlus,
  Map as IconMap,
} from "lucide-vue-next";

interface SitemapItem {
  to: string;
  label: string;
  icon: FunctionalComponent;
}

interface SitemapBlock {
  title: string;
  items: SitemapItem[];
}

const props = defineProps<{
  blocks: SitemapBlock[];
}>();
</script>
