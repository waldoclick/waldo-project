<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

await navigateTo("/featured/free", { replace: true });
</script>
