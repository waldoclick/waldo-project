<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

await navigateTo("/ads/pending", { replace: true });
</script>
