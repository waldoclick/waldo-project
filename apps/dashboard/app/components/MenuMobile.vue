<template>
  <nav class="menu menu--mobile">
    <ul class="menu--mobile__list">
      <!-- Dashboard -->
      <li class="menu--mobile__item">
        <NuxtLink
          to="/"
          class="menu--mobile__link"
          :class="{ 'menu--mobile__link--active': isRouteActive('/') }"
        >
          <LayoutDashboard :size="20" class="menu--mobile__icon" />
          <span>Dashboard</span>
        </NuxtLink>
      </li>

      <!-- Órdenes -->
      <li class="menu--mobile__item">
        <NuxtLink
          to="/orders"
          class="menu--mobile__link"
          :class="{ 'menu--mobile__link--active': isRouteActive('/orders') }"
        >
          <ShoppingCart :size="20" class="menu--mobile__icon" />
          <span>Órdenes</span>
        </NuxtLink>
      </li>

      <!-- Anuncios -->
      <li class="menu--mobile__item">
        <NuxtLink
          to="/ads"
          class="menu--mobile__link"
          :class="{ 'menu--mobile__link--active': isRouteActive('/ads') }"
        >
          <FileText :size="20" class="menu--mobile__icon" />
          <span>Anuncios</span>
        </NuxtLink>
      </li>

      <!-- Reservas -->
      <li class="menu--mobile__item">
        <NuxtLink
          to="/reservations"
          class="menu--mobile__link"
          :class="{
            'menu--mobile__link--active': isRouteActive('/reservations'),
          }"
        >
          <Calendar :size="20" class="menu--mobile__icon" />
          <span>Reservas</span>
        </NuxtLink>
      </li>

      <!-- Usuarios -->
      <li class="menu--mobile__item">
        <NuxtLink
          to="/users"
          class="menu--mobile__link"
          :class="{ 'menu--mobile__link--active': isRouteActive('/users') }"
        >
          <Users :size="20" class="menu--mobile__icon" />
          <span>Usuarios</span>
        </NuxtLink>
      </li>

      <!-- Configurar -->
      <li class="menu--mobile__item">
        <NuxtLink
          to="/categories"
          class="menu--mobile__link"
          :class="{
            'menu--mobile__link--active': isRouteActive('/categories'),
          }"
        >
          <Settings :size="20" class="menu--mobile__icon" />
          <span>Configurar</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Calendar,
  Users,
  Settings,
} from "lucide-vue-next";

const route = useRoute();

const isRouteActive = (path: string): boolean => {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
};
</script>
