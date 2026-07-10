<template>
  <nav class="menu menu--about" aria-label="Menú informativo">
    <nuxt-link
      v-for="link in links"
      :key="link.key"
      :to="link.to"
      class="menu--about__link"
      :class="{ 'menu--about__link--active': active === link.key }"
      :aria-label="link.aria"
      :title="link.aria"
    >
      <component
        :is="link.icon"
        class="menu--about__link__icon"
        aria-hidden="true"
      />
      <span class="menu--about__link__label">{{ link.label }}</span>
    </nuxt-link>
  </nav>
</template>

<script setup lang="ts">
import type { FunctionalComponent } from "vue";
import {
  HelpCircle as IconHelpCircle,
  Shield as IconShield,
  ScrollText as IconScrollText,
  Cookie as IconCookie,
  Lock as IconLock,
  MessageSquare as IconMessageSquare,
  Map as IconMap,
} from "lucide-vue-next";

defineProps<{
  active: string;
}>();

interface MenuAboutLink {
  key: string;
  to: string;
  label: string;
  aria: string;
  icon: FunctionalComponent;
}

const links: MenuAboutLink[] = [
  {
    key: "faq",
    to: "/preguntas-frecuentes",
    label: "Preguntas frecuentes",
    aria: "Ver preguntas frecuentes y respuestas comunes",
    icon: IconHelpCircle,
  },
  {
    key: "priv",
    to: "/politicas-de-privacidad",
    label: "Políticas de privacidad",
    aria: "Leer políticas de privacidad",
    icon: IconShield,
  },
  {
    key: "cond",
    to: "/terminos-y-condiciones-de-uso",
    label: "Condiciones de uso",
    aria: "Leer condiciones de uso",
    icon: IconScrollText,
  },
  {
    key: "cookies",
    to: "/politicas-de-cookies",
    label: "Políticas de cookies",
    aria: "Leer políticas de cookies",
    icon: IconCookie,
  },
  {
    key: "seg",
    to: "/politicas-de-seguridad",
    label: "Políticas de seguridad",
    aria: "Leer políticas de seguridad",
    icon: IconLock,
  },
  {
    key: "cont",
    to: "/contacto",
    label: "Contáctanos",
    aria: "Contactar con el equipo de soporte",
    icon: IconMessageSquare,
  },
  {
    key: "mapa",
    to: "/sitemap",
    label: "Mapa del sitio",
    aria: "Ver mapa del sitio con todas las páginas disponibles",
    icon: IconMap,
  },
];
</script>
