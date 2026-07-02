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
          to="/terminos-y-condiciones-de-uso"
          class="menu--about__link"
          aria-label="Leer términos y condiciones de uso"
          title="Leer términos y condiciones de uso"
        >
          <IconFileText class="menu--about__icon" aria-hidden="true" />
          <span>Condiciones de Uso</span>
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
          to="/politicas-de-cookies"
          class="menu--about__link"
          aria-label="Leer política de cookies"
          title="Leer política de cookies"
        >
          <IconShield class="menu--about__icon" aria-hidden="true" />
          <span>Política de Cookies</span>
        </nuxt-link>
      </li>
      <li class="menu--about__item">
        <nuxt-link
          to="/politicas-de-seguridad"
          class="menu--about__link"
          aria-label="Leer política de seguridad"
          title="Leer política de seguridad"
        >
          <IconShield class="menu--about__icon" aria-hidden="true" />
          <span>Política de Seguridad</span>
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
  FileText as IconFileText,
  MessageSquare as IconMessageSquare,
  Map as IconMap,
} from "lucide-vue-next";
</script>
