<template>
  <footer class="footer footer--dashboard">
    <p>© {{ currentYear }} Waldo.click®</p>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>
