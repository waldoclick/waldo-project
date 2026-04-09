<template>
  <nav class="menu menu--maintenance">
    <ul class="menu--maintenance__list">
      <!-- Categorías -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/maintenance/categories',
          ),
        }"
      >
        <NuxtLink to="/maintenance/categories" class="menu--maintenance__link">
          <Tag class="menu--maintenance__icon" />
          <span>Categorías</span>
        </NuxtLink>
      </li>

      <!-- Condiciones -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/maintenance/conditions',
          ),
        }"
      >
        <NuxtLink to="/maintenance/conditions" class="menu--maintenance__link">
          <FileCheck class="menu--maintenance__icon" />
          <span>Condiciones</span>
        </NuxtLink>
      </li>

      <!-- Packs -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active':
            isRouteActive('/maintenance/packs'),
        }"
      >
        <NuxtLink to="/maintenance/packs" class="menu--maintenance__link">
          <Box class="menu--maintenance__icon" />
          <span>Packs</span>
        </NuxtLink>
      </li>

      <!-- Regiones -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/maintenance/regions',
          ),
        }"
      >
        <NuxtLink to="/maintenance/regions" class="menu--maintenance__link">
          <MapPin class="menu--maintenance__icon" />
          <span>Regiones</span>
        </NuxtLink>
      </li>

      <!-- Comunas -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/maintenance/communes',
          ),
        }"
      >
        <NuxtLink to="/maintenance/communes" class="menu--maintenance__link">
          <Building class="menu--maintenance__icon" />
          <span>Comunas</span>
        </NuxtLink>
      </li>

      <!-- Artículos -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/maintenance/articles',
          ),
        }"
      >
        <NuxtLink to="/maintenance/articles" class="menu--maintenance__link">
          <Newspaper class="menu--maintenance__icon" />
          <span>Artículos</span>
        </NuxtLink>
      </li>

      <!-- Preguntas frecuentes -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive('/maintenance/faqs'),
        }"
      >
        <NuxtLink to="/maintenance/faqs" class="menu--maintenance__link">
          <HelpCircle class="menu--maintenance__icon" />
          <span>Preguntas frecuentes</span>
        </NuxtLink>
      </li>

      <!-- Políticas de privacidad -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/maintenance/policies',
          ),
        }"
      >
        <NuxtLink to="/maintenance/policies" class="menu--maintenance__link">
          <Shield class="menu--maintenance__icon" />
          <span>Políticas de privacidad</span>
        </NuxtLink>
      </li>

      <!-- Condiciones de Uso -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active':
            isRouteActive('/maintenance/terms'),
        }"
      >
        <NuxtLink to="/maintenance/terms" class="menu--maintenance__link">
          <ScrollText class="menu--maintenance__icon" />
          <span>Condiciones de Uso</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";
import {
  Tag,
  FileCheck,
  Box,
  MapPin,
  Building,
  Newspaper,
  HelpCircle,
  Shield,
  ScrollText,
} from "lucide-vue-next";

const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const isRouteActive = (path: string): boolean => {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};

watch(
  () => route.path,
  () => {
    emit("close");
  },
  { immediate: true },
);
</script>
