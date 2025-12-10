<template>
  <NuxtLoadingIndicator color="#ffd699" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ToastNotifications />
</template>

<script setup>
import ToastNotifications from "~/components/ToastNotifications.vue";

const config = useRuntimeConfig();

useHead(() => {
  return {
    meta: config.public.blockSearchEngines
      ? [{ name: "robots", content: "noindex, nofollow" }]
      : [],
  };
});
</script>
