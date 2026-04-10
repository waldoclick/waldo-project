<template>
  <nav class="menu menu--integrations">
    <ul class="menu--integrations__list">
      <!-- Integraciones -->
      <li
        class="menu--integrations__item"
        :class="{
          'menu--integrations__item--active': isIntegrationsRootActive,
        }"
      >
        <NuxtLink to="/integrations" class="menu--integrations__link">
          <Plug class="menu--integrations__icon" />
          <span>Integraciones</span>
        </NuxtLink>
      </li>

      <!-- Search Console -->
      <li
        class="menu--integrations__item"
        :class="{
          'menu--integrations__item--active': isRouteActive(
            '/integrations/search-console',
          ),
        }"
      >
        <NuxtLink
          to="/integrations/search-console"
          class="menu--integrations__link"
        >
          <Search class="menu--integrations__icon" />
          <span>Search Console</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { Plug, Search } from "lucide-vue-next";

const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const isRouteActive = (path: string): boolean => {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
};

const isIntegrationsRootActive = computed(
  () =>
    route.path === "/integrations" ||
    (route.path.startsWith("/integrations/") &&
      !route.path.startsWith("/integrations/search-console")),
);

watch(
  () => route.path,
  () => {
    emit("close");
  },
  { immediate: true },
);
</script>
