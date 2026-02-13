<template>
  <footer class="footer footer--default">
    <p>© {{ currentYear }} Waldo.click®</p>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>
