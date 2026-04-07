<template>
  <div
    class="layout layout--dashboard"
    :class="{ 'layout--dashboard--open': isSidebarOpen }"
  >
    <!-- Overlay: visible on mobile when sidebar is open -->
    <div class="layout--dashboard__overlay" @click="isSidebarOpen = false" />
    <div class="layout--dashboard__menu">
      <MenuDefault @close="isSidebarOpen = false" />
    </div>
    <div class="layout--dashboard__content">
      <HeaderDefault @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      <main class="layout--dashboard__main">
        <slot />
      </main>
      <FooterDefault />
    </div>
    <div class="layout--dashboard__mobile">
      <MenuMobile @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MenuDefault from "@/components/MenuDefault.vue";
import MenuMobile from "@/components/MenuMobile.vue";
import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

const isSidebarOpen = ref(false);
</script>
