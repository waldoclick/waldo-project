<template>
  <nav class="menu menu--mobile">
    <button
      class="menu--mobile__link"
      :title="sidebarOpen ? 'Cerrar menú' : 'Menú'"
      @click="emit('toggle-sidebar')"
    >
      <X v-if="sidebarOpen" :size="22" class="menu--mobile__icon" />
      <Menu v-else :size="22" class="menu--mobile__icon" />
    </button>
    <NuxtLink to="/orders" class="menu--mobile__link" title="Órdenes">
      <ShoppingBag :size="22" class="menu--mobile__icon" />
    </NuxtLink>
    <NuxtLink to="/ads/pending" class="menu--mobile__link" title="Pendientes">
      <Bell :size="22" class="menu--mobile__icon" />
    </NuxtLink>
    <NuxtLink to="/articles" class="menu--mobile__link" title="Artículos">
      <Newspaper :size="22" class="menu--mobile__icon" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { Menu, X, ShoppingBag, Bell, Newspaper } from "lucide-vue-next";

defineProps<{ sidebarOpen: boolean }>();
const emit = defineEmits<{ (e: "toggle-sidebar"): void }>();
</script>
