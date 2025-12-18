<template>
  <div class="dashboard-layout">
    <div class="dashboard-layout__menu">
      <!-- Menu content -->
    </div>
    <div class="dashboard-layout__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Dashboard layout
</script>

<style scoped lang="scss">
.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100%;

  &__menu {
    width: 250px;
    background-color: #ffffff;
  }

  &__content {
    flex: 1;
    background-color: #f5f5f5;
  }
}
</style>

