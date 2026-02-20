<template>
  <nav class="menu menu--default">
    <div class="menu--default__logo">
      <NuxtLink to="/" title="Waldo.click">
        <NuxtImg
          loading="lazy"
          decoding="async"
          src="/images/logo-black.svg"
          alt="Waldo.click"
          title="Waldo.click"
        />
      </NuxtLink>
    </div>
    <ul class="menu--default__list">
      <!-- Dashboard -->
      <li
        class="menu--default__item"
        :class="{ 'menu--default__item--active': isRouteActive('/') }"
      >
        <NuxtLink to="/" class="menu--default__link">
          <LayoutDashboard class="menu--default__icon" />
          <span>Dashboard</span>
        </NuxtLink>
      </li>

      <!-- Órdenes -->
      <li
        class="menu--default__item"
        :class="{ 'menu--default__item--active': isRouteActive('/ordenes') }"
      >
        <NuxtLink to="/ordenes" class="menu--default__link">
          <ShoppingCart class="menu--default__icon" />
          <span>Órdenes</span>
        </NuxtLink>
      </li>

      <!-- Anuncios -->
      <li
        class="menu--default__item"
        :class="{
          'menu--default__item--active': isRouteActive('/anuncios'),
          'menu--default__item--expanded': openMenu === 'anuncios',
        }"
      >
        <button
          class="menu--default__link menu--default__link--button"
          @click="toggleMenu('anuncios')"
        >
          <FileText class="menu--default__icon" />
          <span>Anuncios</span>
          <ChevronDown
            v-if="openMenu === 'anuncios'"
            class="menu--default__arrow"
          />
          <ChevronRight v-else class="menu--default__arrow" />
        </button>
        <ul v-if="openMenu === 'anuncios'" class="menu--default__sublist">
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive(
                '/anuncios/pendientes',
              ),
            }"
          >
            <NuxtLink to="/anuncios/pendientes" class="menu--default__sublink">
              <Clock class="menu--default__subicon" />
              <span>Pendientes</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active':
                isRouteActive('/anuncios/activos'),
            }"
          >
            <NuxtLink to="/anuncios/activos" class="menu--default__sublink">
              <CheckCircle class="menu--default__subicon" />
              <span>Activos</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive(
                '/anuncios/expirados',
              ),
            }"
          >
            <NuxtLink to="/anuncios/expirados" class="menu--default__sublink">
              <AlertCircle class="menu--default__subicon" />
              <span>Expirados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active':
                isRouteActive('/anuncios/baneados'),
            }"
          >
            <NuxtLink to="/anuncios/baneados" class="menu--default__sublink">
              <Ban class="menu--default__subicon" />
              <span>Baneados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive(
                '/anuncios/rechazados',
              ),
            }"
          >
            <NuxtLink to="/anuncios/rechazados" class="menu--default__sublink">
              <XCircle class="menu--default__subicon" />
              <span>Rechazados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive(
                '/anuncios/abandonados',
              ),
            }"
          >
            <NuxtLink to="/anuncios/abandonados" class="menu--default__sublink">
              <XOctagon class="menu--default__subicon" />
              <span>Abandonados</span>
            </NuxtLink>
          </li>
        </ul>
      </li>

      <!-- Reservas -->
      <li
        class="menu--default__item"
        :class="{
          'menu--default__item--active': isRouteActive('/reservas'),
          'menu--default__item--expanded': openMenu === 'reservas',
        }"
      >
        <button
          class="menu--default__link menu--default__link--button"
          @click="toggleMenu('reservas')"
        >
          <Calendar class="menu--default__icon" />
          <span>Reservas</span>
          <ChevronDown
            v-if="openMenu === 'reservas'"
            class="menu--default__arrow"
          />
          <ChevronRight v-else class="menu--default__arrow" />
        </button>
        <ul v-if="openMenu === 'reservas'" class="menu--default__sublist">
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active':
                isRouteActive('/reservas/usadas'),
            }"
          >
            <NuxtLink to="/reservas/usadas" class="menu--default__sublink">
              <CheckCircle class="menu--default__subicon" />
              <span>Usadas</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active':
                isRouteActive('/reservas/libres'),
            }"
          >
            <NuxtLink to="/reservas/libres" class="menu--default__sublink">
              <Circle class="menu--default__subicon" />
              <span>Libres</span>
            </NuxtLink>
          </li>
        </ul>
      </li>

      <!-- Destacados -->
      <li
        class="menu--default__item"
        :class="{
          'menu--default__item--active': isRouteActive('/destacados'),
          'menu--default__item--expanded': openMenu === 'destacados',
        }"
      >
        <button
          class="menu--default__link menu--default__link--button"
          @click="toggleMenu('destacados')"
        >
          <Star class="menu--default__icon" />
          <span>Destacados</span>
          <ChevronDown
            v-if="openMenu === 'destacados'"
            class="menu--default__arrow"
          />
          <ChevronRight v-else class="menu--default__arrow" />
        </button>
        <ul v-if="openMenu === 'destacados'" class="menu--default__sublist">
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active':
                isRouteActive('/destacados/usados'),
            }"
          >
            <NuxtLink to="/destacados/usados" class="menu--default__sublink">
              <CheckCircle class="menu--default__subicon" />
              <span>Usados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active':
                isRouteActive('/destacados/libres'),
            }"
          >
            <NuxtLink to="/destacados/libres" class="menu--default__sublink">
              <Circle class="menu--default__subicon" />
              <span>Libres</span>
            </NuxtLink>
          </li>
        </ul>
      </li>

      <!-- Usuarios -->
      <li
        class="menu--default__item"
        :class="{ 'menu--default__item--active': isRouteActive('/usuarios') }"
      >
        <NuxtLink to="/usuarios" class="menu--default__link">
          <Users class="menu--default__icon" />
          <span>Usuarios</span>
        </NuxtLink>
      </li>

      <!-- Mantenedores -->
      <li
        class="menu--default__item"
        :class="{
          'menu--default__item--active': isMantenedoresActive,
          'menu--default__item--expanded': openMenu === 'mantenedores',
        }"
      >
        <button
          class="menu--default__link menu--default__link--button"
          @click="toggleMenu('mantenedores')"
        >
          <Settings class="menu--default__icon" />
          <span>Mantenedores</span>
          <ChevronDown
            v-if="openMenu === 'mantenedores'"
            class="menu--default__arrow"
          />
          <ChevronRight v-else class="menu--default__arrow" />
        </button>
        <ul v-if="openMenu === 'mantenedores'" class="menu--default__sublist">
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/categorias'),
            }"
          >
            <NuxtLink to="/categorias" class="menu--default__sublink">
              <Tag class="menu--default__subicon" />
              <span>Categorías</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/condiciones'),
            }"
          >
            <NuxtLink to="/condiciones" class="menu--default__sublink">
              <FileCheck class="menu--default__subicon" />
              <span>Condiciones</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/faqs'),
            }"
          >
            <NuxtLink to="/faqs" class="menu--default__sublink">
              <HelpCircle class="menu--default__subicon" />
              <span>FAQ</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/packs'),
            }"
          >
            <NuxtLink to="/packs" class="menu--default__sublink">
              <Box class="menu--default__subicon" />
              <span>Packs</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/regiones'),
            }"
          >
            <NuxtLink to="/regiones" class="menu--default__sublink">
              <MapPin class="menu--default__subicon" />
              <span>Regiones</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/comunas'),
            }"
          >
            <NuxtLink to="/comunas" class="menu--default__sublink">
              <Building class="menu--default__subicon" />
              <span>Comunas</span>
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Calendar,
  Star,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Ban,
  XCircle,
  XOctagon,
  Circle,
  Tag,
  FileCheck,
  HelpCircle,
  Box,
  MapPin,
  Building,
} from "lucide-vue-next";

const route = useRoute();
const openMenu = ref<string | null>(null);

// Detectar si una ruta está activa
const isRouteActive = (path: string): boolean => {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
};

// Detectar si algún mantenedor está activo
const isMantenedoresActive = computed(() => {
  return (
    isRouteActive("/categorias") ||
    isRouteActive("/condiciones") ||
    isRouteActive("/faqs") ||
    isRouteActive("/packs") ||
    isRouteActive("/regiones") ||
    isRouteActive("/comunas")
  );
});

// Toggle del menú (solo uno abierto a la vez)
const toggleMenu = (menu: string) => {
  openMenu.value = openMenu.value === menu ? null : menu;
};

// Auto-expandir menú si hay un subitem activo
watch(
  () => route.path,
  (path) => {
    if (path.startsWith("/anuncios")) {
      openMenu.value = "anuncios";
    } else if (path.startsWith("/reservas")) {
      openMenu.value = "reservas";
    } else if (path.startsWith("/destacados")) {
      openMenu.value = "destacados";
    } else if (
      path.startsWith("/categorias") ||
      path.startsWith("/condiciones") ||
      path.startsWith("/faqs") ||
      path.startsWith("/packs") ||
      path.startsWith("/regiones") ||
      path.startsWith("/comunas")
    ) {
      openMenu.value = "mantenedores";
    } else {
      openMenu.value = null;
    }
  },
  { immediate: true },
);
</script>
