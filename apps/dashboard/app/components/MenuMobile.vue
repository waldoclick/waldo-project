<template>
  <nav class="menu menu--mobile">
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
import { ShoppingBag, Bell, Newspaper } from "lucide-vue-next";
</script>
