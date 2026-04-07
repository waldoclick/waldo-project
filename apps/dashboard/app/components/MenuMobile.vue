<template>
  <nav class="layout--dashboard__mobile__nav">
    <NuxtLink
      to="/orders"
      class="layout--dashboard__mobile__link"
      title="Órdenes"
    >
      <ShoppingBag :size="22" />
    </NuxtLink>
    <NuxtLink
      to="/ads/pending"
      class="layout--dashboard__mobile__link"
      title="Pendientes"
    >
      <Bell :size="22" />
    </NuxtLink>
    <NuxtLink
      to="/articles"
      class="layout--dashboard__mobile__link"
      title="Artículos"
    >
      <Newspaper :size="22" />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { ShoppingBag, Bell, Newspaper } from "lucide-vue-next";
</script>
