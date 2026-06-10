<template>
  <nav class="menu menu--users">
    <ul class="menu--users__list">
      <!-- Usuarios -->
      <li
        class="menu--users__item"
        :class="{
          'menu--users__item--active': isUsersRootActive,
        }"
      >
        <NuxtLink to="/dashboard/users" class="menu--users__link">
          <Users class="menu--users__icon" />
          <span>Usuarios</span>
        </NuxtLink>
      </li>

      <!-- Suscripciones PRO -->
      <li
        class="menu--users__item"
        :class="{
          'menu--users__item--active': isRouteActive(
            '/dashboard/users/subscription-pros',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/users/subscription-pros"
          class="menu--users__link"
        >
          <BadgeCheck class="menu--users__icon" />
          <span>Suscripciones PRO</span>
        </NuxtLink>
      </li>

      <!-- Pagos -->
      <li
        class="menu--users__item"
        :class="{
          'menu--users__item--active': isRouteActive(
            '/dashboard/users/subscription-payments',
          ),
        }"
      >
        <NuxtLink
          to="/dashboard/users/subscription-payments"
          class="menu--users__link"
        >
          <Receipt class="menu--users__icon" />
          <span>Pagos</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { Users, BadgeCheck, Receipt } from "lucide-vue-next";

const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const isRouteActive = (path: string): boolean => {
  if (path === "/dashboard/users") return route.path === "/dashboard/users";
  return route.path.startsWith(path);
};

const isUsersRootActive = computed(() => {
  return (
    route.path === "/dashboard/users" ||
    (route.path.startsWith("/dashboard/users/") &&
      !route.path.startsWith("/dashboard/users/subscription-pros") &&
      !route.path.startsWith("/dashboard/users/subscription-payments"))
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
