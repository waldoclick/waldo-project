<template>
  <nav class="menu menu--about" aria-label="Menú informativo">
    <ul class="menu--about__list" role="list">
      <li class="menu--about__item">
        <nuxt-link
          to="/preguntas-frecuentes"
          class="menu--about__link"
          aria-label="Ver preguntas frecuentes y respuestas comunes"
          title="Ver preguntas frecuentes y respuestas comunes"
        >
          <IconHelpCircle class="menu--about__icon" aria-hidden="true" />
          <span>Preguntas frecuentes</span>
        </nuxt-link>
      </li>
      <li class="menu--about__item">
        <nuxt-link
          to="/politicas-de-privacidad"
          class="menu--about__link"
          aria-label="Leer políticas de privacidad y términos de uso"
          title="Leer políticas de privacidad y términos de uso"
        >
          <IconShield class="menu--about__icon" aria-hidden="true" />
          <span>Políticas de privacidad</span>
        </nuxt-link>
      </li>
      <li class="menu--about__item">
        <nuxt-link
          to="/contacto"
          class="menu--about__link"
          aria-label="Contactar con el equipo de soporte"
          title="Contactar con el equipo de soporte"
        >
          <IconMessageSquare class="menu--about__icon" aria-hidden="true" />
          <span>Contáctanos</span>
        </nuxt-link>
      </li>
      <li class="menu--about__item">
        <nuxt-link
          to="/sitemap"
          class="menu--about__link"
          aria-label="Ver mapa del sitio con todas las páginas disponibles"
          title="Ver mapa del sitio con todas las páginas disponibles"
        >
          <IconMap class="menu--about__icon" aria-hidden="true" />
          <span>Mapa del sitio</span>
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import {
  HelpCircle as IconHelpCircle,
  Shield as IconShield,
  MessageSquare as IconMessageSquare,
  Map as IconMap,
} from "lucide-vue-next";
</script>
