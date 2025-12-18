<template>
  <NuxtLoadingIndicator color="#ffd699" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const config = useRuntimeConfig();

useHead(() => {
  return {
    meta: config.public.blockSearchEngines
      ? [{ name: "robots", content: "noindex, nofollow" }]
      : [],
  };
});
</script>
