<template>
  <NuxtLoadingIndicator color="#ffd699" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
useHead({
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});
</script>
