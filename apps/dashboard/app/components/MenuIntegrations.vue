<template>
  <nav class="menu menu--integrations">
    <ul class="menu--integrations__list">
      <!-- Integraciones -->
      <li
        class="menu--integrations__item"
        :class="{
          'menu--integrations__item--active': isRouteActive('/integrations'),
        }"
      >
        <NuxtLink to="/integrations" class="menu--integrations__link">
          <Plug class="menu--integrations__icon" />
          <span>Integraciones</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";
import { Plug } from "lucide-vue-next";

const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const isRouteActive = (path: string): boolean => {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};

watch(
  () => route.path,
  () => {
    emit("close");
  },
  { immediate: true },
);
</script>
