<template>
  <nav class="menu menu--dashboard">
    <ul class="menu--dashboard__list">
      <!-- Dashboard -->
      <li
        class="menu--dashboard__item"
        :class="{
          'menu--dashboard__item--active': isRouteActive('/dashboard'),
        }"
      >
        <NuxtLink to="/dashboard" class="menu--dashboard__link">
          <LayoutDashboard class="menu--dashboard__icon" />
          <span>Dashboard</span>
        </NuxtLink>
      </li>

      <!-- Órdenes -->
      <li
        class="menu--dashboard__item"
        :class="{
          'menu--dashboard__item--active': isRouteActive('/dashboard/orders'),
        }"
      >
        <NuxtLink to="/dashboard/orders" class="menu--dashboard__link">
          <ShoppingCart class="menu--dashboard__icon" />
          <span>Órdenes</span>
        </NuxtLink>
      </li>

      <!-- Anuncios -->
      <li
        class="menu--dashboard__item"
        :class="{
          'menu--dashboard__item--active': isRouteActive('/dashboard/ads'),
          'menu--dashboard__item--expanded': openMenu === 'ads',
        }"
      >
        <button
          class="menu--dashboard__link menu--dashboard__link--button"
          @click="toggleMenu('ads')"
        >
          <FileText class="menu--dashboard__icon" />
          <span>Anuncios</span>
          <ChevronDown
            v-if="openMenu === 'ads'"
            class="menu--dashboard__arrow"
          />
          <ChevronRight v-else class="menu--dashboard__arrow" />
        </button>
        <ul v-if="openMenu === 'ads'" class="menu--dashboard__sublist">
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/ads/pending',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/ads/pending"
              class="menu--dashboard__sublink"
            >
              <Clock class="menu--dashboard__subicon" />
              <span>Pendientes</span>
            </NuxtLink>
          </li>
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/ads/active',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/ads/active"
              class="menu--dashboard__sublink"
            >
              <CheckCircle class="menu--dashboard__subicon" />
              <span>Activos</span>
            </NuxtLink>
          </li>
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/ads/expired',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/ads/expired"
              class="menu--dashboard__sublink"
            >
              <AlertCircle class="menu--dashboard__subicon" />
              <span>Expirados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/ads/banned',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/ads/banned"
              class="menu--dashboard__sublink"
            >
              <Ban class="menu--dashboard__subicon" />
              <span>Baneados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/ads/rejected',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/ads/rejected"
              class="menu--dashboard__sublink"
            >
              <XCircle class="menu--dashboard__subicon" />
              <span>Rechazados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/ads/abandoned',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/ads/abandoned"
              class="menu--dashboard__sublink"
            >
              <XOctagon class="menu--dashboard__subicon" />
              <span>Borradores</span>
            </NuxtLink>
          </li>
        </ul>
      </li>

      <!-- Reservas -->
      <li
        class="menu--dashboard__item"
        :class="{
          'menu--dashboard__item--active': isRouteActive(
            '/dashboard/reservations',
          ),
          'menu--dashboard__item--expanded': openMenu === 'reservations',
        }"
      >
        <button
          class="menu--dashboard__link menu--dashboard__link--button"
          @click="toggleMenu('reservations')"
        >
          <Calendar class="menu--dashboard__icon" />
          <span>Reservas</span>
          <ChevronDown
            v-if="openMenu === 'reservations'"
            class="menu--dashboard__arrow"
          />
          <ChevronRight v-else class="menu--dashboard__arrow" />
        </button>
        <ul v-if="openMenu === 'reservations'" class="menu--dashboard__sublist">
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/reservations/used',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/reservations/used"
              class="menu--dashboard__sublink"
            >
              <CheckCircle class="menu--dashboard__subicon" />
              <span>Usadas</span>
            </NuxtLink>
          </li>
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/reservations/free',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/reservations/free"
              class="menu--dashboard__sublink"
            >
              <Circle class="menu--dashboard__subicon" />
              <span>Libres</span>
            </NuxtLink>
          </li>
        </ul>
      </li>

      <!-- Destacados -->
      <li
        class="menu--dashboard__item"
        :class="{
          'menu--dashboard__item--active': isRouteActive('/dashboard/featured'),
          'menu--dashboard__item--expanded': openMenu === 'featured',
        }"
      >
        <button
          class="menu--dashboard__link menu--dashboard__link--button"
          @click="toggleMenu('featured')"
        >
          <Star class="menu--dashboard__icon" />
          <span>Destacados</span>
          <ChevronDown
            v-if="openMenu === 'featured'"
            class="menu--dashboard__arrow"
          />
          <ChevronRight v-else class="menu--dashboard__arrow" />
        </button>
        <ul v-if="openMenu === 'featured'" class="menu--dashboard__sublist">
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/featured/used',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/featured/used"
              class="menu--dashboard__sublink"
            >
              <CheckCircle class="menu--dashboard__subicon" />
              <span>Usados</span>
            </NuxtLink>
          </li>
          <li
            class="menu--dashboard__subitem"
            :class="{
              'menu--dashboard__subitem--active': isRouteActive(
                '/dashboard/featured/free',
              ),
            }"
          >
            <NuxtLink
              to="/dashboard/featured/free"
              class="menu--dashboard__sublink"
            >
              <Circle class="menu--dashboard__subicon" />
              <span>Libres</span>
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Calendar,
  Star,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Ban,
  XCircle,
  XOctagon,
  Circle,
} from "lucide-vue-next";

const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();
const openMenu = ref<string | null>(null);

const isRouteActive = (path: string): boolean => {
  if (path === "/dashboard") return route.path === "/dashboard";
  return route.path.startsWith(path);
};

const toggleMenu = (menu: string) => {
  openMenu.value = openMenu.value === menu ? null : menu;
};

watch(
  () => route.path,
  (path) => {
    if (path.startsWith("/dashboard/ads")) {
      openMenu.value = "ads";
    } else if (path.startsWith("/dashboard/reservations")) {
      openMenu.value = "reservations";
    } else if (path.startsWith("/dashboard/featured")) {
      openMenu.value = "featured";
    } else {
      openMenu.value = null;
    }
    emit("close");
  },
  { immediate: true },
);
</script>
