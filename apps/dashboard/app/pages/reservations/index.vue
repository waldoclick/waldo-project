<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

await navigateTo("/reservas/libres", { replace: true });
</script>
