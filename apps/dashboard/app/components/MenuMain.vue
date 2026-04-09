<template>
  <nav class="menu menu--main">
    <button type="button" class="menu--main__btn" aria-label="Dashboard">
      <LayoutDashboard class="menu--main__icon" />
    </button>
    <button type="button" class="menu--main__btn" aria-label="Usuarios">
      <Users class="menu--main__icon" />
    </button>
    <button type="button" class="menu--main__btn" aria-label="Mantenedores">
      <Settings class="menu--main__icon" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { LayoutDashboard, Users, Settings } from "lucide-vue-next";
</script>
