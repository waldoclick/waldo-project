<template>
  <div
    class="layout layout--dashboard"
    :class="{ 'layout--dashboard--open': isSidebarOpen }"
  >
    <div class="layout--dashboard__menu">
      <div class="layout--dashboard__menu__rail">
        <MenuMain />
      </div>
      <div class="layout--dashboard__menu__nav">
        <MenuDefault @close="isSidebarOpen = false" />
      </div>
    </div>
    <div class="layout--dashboard__mobile">
      <MenuMobile
        :sidebar-open="isSidebarOpen"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />
    </div>
    <div class="layout--dashboard__content">
      <HeaderDefault
        :sidebar-open="isSidebarOpen"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />
      <main class="layout--dashboard__main">
        <slot />
      </main>
      <FooterDefault />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MenuDefault from "@/components/MenuDefault.vue";
import MenuMain from "@/components/MenuMain.vue";
import MenuMobile from "@/components/MenuMobile.vue";
import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

const isSidebarOpen = ref(false);
</script>
