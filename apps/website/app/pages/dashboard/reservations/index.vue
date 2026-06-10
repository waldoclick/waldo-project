<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

await navigateTo("/reservations/free", { replace: true });
</script>
