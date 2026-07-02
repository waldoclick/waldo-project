<template>
  <nav class="menu menu--maintenance">
    <ul class="menu--maintenance__list">
      <!-- Mantenedores -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isMaintenanceRootActive,
        }"
      >
        <NuxtLink to="/dashboard/maintenance" class="menu--maintenance__link">
          <Settings class="menu--maintenance__icon" />
          <span>Mantenedores</span>
        </NuxtLink>
      </li>

      <!-- Categorías -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/categories',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/categories"
          class="menu--maintenance__link"
        >
          <Tag class="menu--maintenance__icon" />
          <span>Categorías</span>
        </NuxtLink>
      </li>

      <!-- Condiciones -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/conditions',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/conditions"
          class="menu--maintenance__link"
        >
          <FileCheck class="menu--maintenance__icon" />
          <span>Condiciones</span>
        </NuxtLink>
      </li>

      <!-- Packs -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/packs',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/packs"
          class="menu--maintenance__link"
        >
          <Box class="menu--maintenance__icon" />
          <span>Packs</span>
        </NuxtLink>
      </li>

      <!-- Regiones -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/regions',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/regions"
          class="menu--maintenance__link"
        >
          <MapPin class="menu--maintenance__icon" />
          <span>Regiones</span>
        </NuxtLink>
      </li>

      <!-- Comunas -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/communes',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/communes"
          class="menu--maintenance__link"
        >
          <Building class="menu--maintenance__icon" />
          <span>Comunas</span>
        </NuxtLink>
      </li>

      <!-- Preguntas frecuentes -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/faqs',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/faqs"
          class="menu--maintenance__link"
        >
          <HelpCircle class="menu--maintenance__icon" />
          <span>Preguntas frecuentes</span>
        </NuxtLink>
      </li>

      <!-- Políticas de privacidad -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/policies',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/policies"
          class="menu--maintenance__link"
        >
          <Shield class="menu--maintenance__icon" />
          <span>Políticas de privacidad</span>
        </NuxtLink>
      </li>

      <!-- Términos y Condiciones de Uso -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/terms',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/terms"
          class="menu--maintenance__link"
        >
          <ScrollText class="menu--maintenance__icon" />
          <span>Términos y Condiciones de Uso</span>
        </NuxtLink>
      </li>

      <!-- Política de Cookies -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/cookies',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/cookies"
          class="menu--maintenance__link"
        >
          <Cookie class="menu--maintenance__icon" />
          <span>Política de Cookies</span>
        </NuxtLink>
      </li>

      <!-- Política de Seguridad -->
      <li
        class="menu--maintenance__item"
        :class="{
          'menu--maintenance__item--active': isRouteActive(
            '/dashboard/maintenance/security',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/maintenance/security"
          class="menu--maintenance__link"
        >
          <ShieldCheck class="menu--maintenance__icon" />
          <span>Política de Seguridad</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import {
  Settings,
  Tag,
  FileCheck,
  Box,
  MapPin,
  Building,
  HelpCircle,
  Shield,
  ScrollText,
  Cookie,
  ShieldCheck,
} from "lucide-vue-next";

const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const isRouteActive = (path: string): boolean => {
  if (path === "/dashboard/maintenance")
    return route.path === "/dashboard/maintenance";
  return route.path.startsWith(path);
};

const knownSubRoutes = [
  "/dashboard/maintenance/categories",
  "/dashboard/maintenance/conditions",
  "/dashboard/maintenance/packs",
  "/dashboard/maintenance/regions",
  "/dashboard/maintenance/communes",
  "/dashboard/maintenance/faqs",
  "/dashboard/maintenance/policies",
  "/dashboard/maintenance/terms",
  "/dashboard/maintenance/cookies",
  "/dashboard/maintenance/security",
];

const isMaintenanceRootActive = computed(
  () =>
    route.path === "/dashboard/maintenance" ||
    (route.path.startsWith("/dashboard/maintenance/") &&
      !knownSubRoutes.some((r) => route.path.startsWith(r))),
);

watch(
  () => route.path,
  () => {
    emit("close");
  },
  { immediate: true },
);
</script>
