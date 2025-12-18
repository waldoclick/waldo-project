<template>
  <div class="layout layout--dashboard">
    <div class="layout--dashboard__menu">
      <MenuDefault />
    </div>
    <div class="layout--dashboard__content">
      <HeaderDefault />
      <main class="layout--dashboard__main">
        <slot />
      </main>
      <FooterDefault />
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuDefault from "@/components/MenuDefault.vue";
import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
</script>
