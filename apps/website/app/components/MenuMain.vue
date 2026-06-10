<template>
  <nav class="menu menu--main">
    <NuxtLink to="/dashboard" class="menu--main__btn" aria-label="Dashboard">
      <LayoutDashboard class="menu--main__icon" />
    </NuxtLink>
    <NuxtLink
      to="/dashboard/articles"
      class="menu--main__btn"
      :class="{ 'menu--main__btn--active': activeMenu === 'articles' }"
      aria-label="Artículos"
    >
      <Newspaper class="menu--main__icon" />
    </NuxtLink>
    <NuxtLink
      to="/dashboard/users"
      class="menu--main__btn"
      :class="{ 'menu--main__btn--active': activeMenu === 'users' }"
      aria-label="Usuarios"
    >
      <Users class="menu--main__icon" />
    </NuxtLink>
    <NuxtLink
      to="/dashboard/maintenance"
      class="menu--main__btn"
      :class="{ 'menu--main__btn--active': activeMenu === 'maintenance' }"
      aria-label="Mantenedores"
    >
      <Settings class="menu--main__icon" />
    </NuxtLink>
    <NuxtLink
      to="/dashboard/integrations"
      class="menu--main__btn"
      :class="{ 'menu--main__btn--active': activeMenu === 'integrations' }"
      aria-label="Integraciones"
    >
      <Plug class="menu--main__icon" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  Plug,
} from "lucide-vue-next";

defineProps<{
  activeMenu: "default" | "articles" | "users" | "maintenance" | "integrations";
}>();
</script>
