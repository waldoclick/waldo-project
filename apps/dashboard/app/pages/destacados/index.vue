<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

await navigateTo("/destacados/libres", { replace: true });
</script>
