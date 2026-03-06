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
        :class="{ 'menu--default__item--active': isRouteActive('/orders') }"
      >
        <NuxtLink to="/orders" class="menu--default__link">
          <ShoppingCart class="menu--default__icon" />
          <span>Órdenes</span>
        </NuxtLink>
      </li>

      <!-- Anuncios -->
      <li
        class="menu--default__item"
        :class="{
          'menu--default__item--active': isRouteActive('/ads'),
          'menu--default__item--expanded': openMenu === 'ads',
        }"
      >
        <button
          class="menu--default__link menu--default__link--button"
          @click="toggleMenu('ads')"
        >
          <FileText class="menu--default__icon" />
          <span>Anuncios</span>
          <ChevronDown v-if="openMenu === 'ads'" class="menu--default__arrow" />
          <ChevronRight v-else class="menu--default__arrow" />
        </button>
        <ul v-if="openMenu === 'ads'" class="menu--default__sublist">
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/ads/pending'),
            }"
          >
            <NuxtLink to="/ads/pending" class="menu--default__sublink">
              <Clock class="menu--default__subicon" />
              <span>Pendientes</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/ads/active'),
            }"
          >
            <NuxtLink to="/ads/active" class="menu--default__sublink">
              <CheckCircle class="menu--default__subicon" />
              <span>Activos</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/ads/expired'),
            }"
          >
            <NuxtLink to="/ads/expired" class="menu--default__sublink">
              <AlertCircle class="menu--default__subicon" />
              <span>Expirados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/ads/banned'),
            }"
          >
            <NuxtLink to="/ads/banned" class="menu--default__sublink">
              <Ban class="menu--default__subicon" />
              <span>Baneados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/ads/rejected'),
            }"
          >
            <NuxtLink to="/ads/rejected" class="menu--default__sublink">
              <XCircle class="menu--default__subicon" />
              <span>Rechazados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/ads/abandoned'),
            }"
          >
            <NuxtLink to="/ads/abandoned" class="menu--default__sublink">
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
          'menu--default__item--active': isRouteActive('/reservations'),
          'menu--default__item--expanded': openMenu === 'reservations',
        }"
      >
        <button
          class="menu--default__link menu--default__link--button"
          @click="toggleMenu('reservations')"
        >
          <Calendar class="menu--default__icon" />
          <span>Reservas</span>
          <ChevronDown
            v-if="openMenu === 'reservations'"
            class="menu--default__arrow"
          />
          <ChevronRight v-else class="menu--default__arrow" />
        </button>
        <ul v-if="openMenu === 'reservations'" class="menu--default__sublist">
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active':
                isRouteActive('/reservations/used'),
            }"
          >
            <NuxtLink to="/reservations/used" class="menu--default__sublink">
              <CheckCircle class="menu--default__subicon" />
              <span>Usadas</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active':
                isRouteActive('/reservations/free'),
            }"
          >
            <NuxtLink to="/reservations/free" class="menu--default__sublink">
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
          'menu--default__item--active': isRouteActive('/featured'),
          'menu--default__item--expanded': openMenu === 'featured',
        }"
      >
        <button
          class="menu--default__link menu--default__link--button"
          @click="toggleMenu('featured')"
        >
          <Star class="menu--default__icon" />
          <span>Destacados</span>
          <ChevronDown
            v-if="openMenu === 'featured'"
            class="menu--default__arrow"
          />
          <ChevronRight v-else class="menu--default__arrow" />
        </button>
        <ul v-if="openMenu === 'featured'" class="menu--default__sublist">
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/featured/used'),
            }"
          >
            <NuxtLink to="/featured/used" class="menu--default__sublink">
              <CheckCircle class="menu--default__subicon" />
              <span>Usados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--default__subitem"
            :class="{
              'menu--default__subitem--active': isRouteActive('/featured/free'),
            }"
          >
            <NuxtLink to="/featured/free" class="menu--default__sublink">
              <Circle class="menu--default__subicon" />
              <span>Libres</span>
            </NuxtLink>
          </li>
        </ul>
      </li>

      <!-- Usuarios -->
      <li
        class="menu--default__item"
        :class="{ 'menu--default__item--active': isRouteActive('/users') }"
      >
        <NuxtLink to="/users" class="menu--default__link">
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
