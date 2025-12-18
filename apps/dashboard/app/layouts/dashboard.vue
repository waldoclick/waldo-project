<template>
  <div class="layout layout--dashboard">
    <div class="layout--dashboard__menu">
      <MenuDefault />
    </div>
    <div class="layout--dashboard__content">
      <HeaderDefault />
      <main class="layout--dashboard__main">
        <HeroDefault
          v-if="route.path !== '/'"
          :title="pageTitle"
          :breadcrumbs="breadcrumbs"
        />
        <slot />
      </main>
      <FooterDefault />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import MenuDefault from "@/components/MenuDefault.vue";
import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import HeroDefault from "@/components/HeroDefault.vue";

const route = useRoute();

// Generar título y breadcrumbs basados en la ruta
const pageTitle = computed(() => {
  const path = route.path;
  if (path === "/") return "";

  // Obtener el último segmento de la ruta
  const segments = path.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // Convertir slug a título
  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

const breadcrumbs = computed(() => {
  const path = route.path;
  if (path === "/") return [];

  const segments = path.split("/").filter(Boolean);
  const items = [];

  let currentPath = "";
  for (const [index, segment] of segments.entries()) {
    currentPath += `/${segment}`;
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    items.push({
      label,
      to: index < segments.length - 1 ? currentPath : undefined,
    });
  }

  return items;
});
</script>
