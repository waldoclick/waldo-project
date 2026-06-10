<template>
  <nav class="menu menu--articles">
    <ul class="menu--articles__list">
      <!-- Artículos -->
      <li
        class="menu--articles__item"
        :class="{
          'menu--articles__item--active': isArticlesRootActive,
        }"
      >
        <NuxtLink to="/dashboard/articles" class="menu--articles__link">
          <Newspaper class="menu--articles__icon" />
          <span>Artículos</span>
        </NuxtLink>
      </li>

      <!-- Nuevo artículo -->
      <li
        class="menu--articles__item"
        :class="{
          'menu--articles__item--active': isRouteActive(
            '/dashboard/articles/new',
          ),
        }"
      >
        <NuxtLink to="/dashboard/articles/new" class="menu--articles__link">
          <FilePlus class="menu--articles__icon" />
          <span>Nuevo artículo</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { Newspaper, FilePlus } from "lucide-vue-next";

const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const isRouteActive = (path: string): boolean => {
  if (path === "/dashboard/articles")
    return route.path === "/dashboard/articles";
  return route.path.startsWith(path);
};

const isArticlesRootActive = computed(() => {
  return (
    route.path === "/dashboard/articles" ||
    (route.path.startsWith("/dashboard/articles/") &&
      !route.path.startsWith("/dashboard/articles/new"))
  );
});

watch(
  () => route.path,
  () => {
    emit("close");
  },
  { immediate: true },
);
</script>
