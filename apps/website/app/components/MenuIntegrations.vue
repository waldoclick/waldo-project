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
        <NuxtLink to="/dashboard/integrations" class="menu--integrations__link">
          <Plug class="menu--integrations__icon" />
          <span>Integraciones</span>
        </NuxtLink>
      </li>

      <!-- Search Console -->
      <li
        class="menu--integrations__item"
        :class="{
          'menu--integrations__item--active': isRouteActive(
            '/dashboard/integrations/search-console',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/integrations/search-console"
          class="menu--integrations__link"
        >
          <Search class="menu--integrations__icon" />
          <span>Search Console</span>
        </NuxtLink>
      </li>

      <!-- Google Analytics -->
      <li
        class="menu--integrations__item"
        :class="{
          'menu--integrations__item--active': isRouteActive(
            '/dashboard/integrations/google-analytics',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/integrations/google-analytics"
          class="menu--integrations__link"
        >
          <BarChart2 class="menu--integrations__icon" />
          <span>Google Analytics</span>
        </NuxtLink>
      </li>

      <!-- Cloudflare -->
      <li
        class="menu--integrations__item"
        :class="{
          'menu--integrations__item--active': isRouteActive(
            '/dashboard/integrations/cloudflare',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/integrations/cloudflare"
          class="menu--integrations__link"
        >
          <Shield class="menu--integrations__icon" />
          <span>Cloudflare</span>
        </NuxtLink>
      </li>

      <!-- Better Stack -->
      <li
        class="menu--integrations__item"
        :class="{
          'menu--integrations__item--active': isRouteActive(
            '/dashboard/integrations/better-stack',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/integrations/better-stack"
          class="menu--integrations__link"
        >
          <IconsIconBetterStack class="menu--integrations__icon" />
          <span>Better Stack</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { Plug, Search, Shield, BarChart2 } from "lucide-vue-next";

const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const isRouteActive = (path: string): boolean => {
  if (path === "/dashboard/integrations")
    return route.path === "/dashboard/integrations";
  return route.path.startsWith(path);
};

const isIntegrationsRootActive = computed(
  () =>
    route.path === "/dashboard/integrations" ||
    (route.path.startsWith("/dashboard/integrations/") &&
      !route.path.startsWith("/dashboard/integrations/search-console") &&
      !route.path.startsWith("/dashboard/integrations/google-analytics") &&
      !route.path.startsWith("/dashboard/integrations/cloudflare") &&
      !route.path.startsWith("/dashboard/integrations/better-stack")),
);

watch(
  () => route.path,
  () => {
    emit("close");
  },
  { immediate: true },
);
</script>
