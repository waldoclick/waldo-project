<template>
  <nav class="menu menu--main">
    <button
      type="button"
      class="menu--main__btn"
      aria-label="Dashboard"
      @click="emit('select', 'default')"
    >
      <LayoutDashboard class="menu--main__icon" />
    </button>
    <button
      type="button"
      class="menu--main__btn"
      :class="{ 'menu--main__btn--active': activeMenu === 'users' }"
      aria-label="Usuarios"
      @click="emit('select', 'users')"
    >
      <Users class="menu--main__icon" />
    </button>
    <button
      type="button"
      class="menu--main__btn"
      :class="{ 'menu--main__btn--active': activeMenu === 'maintenance' }"
      aria-label="Mantenedores"
      @click="emit('select', 'maintenance')"
    >
      <Settings class="menu--main__icon" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { LayoutDashboard, Users, Settings } from "lucide-vue-next";

defineProps<{ activeMenu: "default" | "users" | "maintenance" }>();
const emit = defineEmits<{
  (e: "select", panel: "default" | "users" | "maintenance"): void;
}>();
</script>
