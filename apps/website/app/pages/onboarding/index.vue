<template>
  <div class="page">
    <OnboardingDefault @success="navigateTo('/onboarding/thankyou')" />
  </div>
</template>

<script setup lang="ts">
import { useRegionsStore } from "@/stores/regions.store";
import { useCommunesStore } from "@/stores/communes.store";

const regionsStore = useRegionsStore();
const communesStore = useCommunesStore();

await useAsyncData("onboarding-regions-communes", async () => {
  await regionsStore.loadRegions();
  await communesStore.loadCommunes();
});

definePageMeta({
  layout: "onboarding",
  middleware: "auth",
});

useSeoMeta({ robots: "noindex, nofollow" });
</script>
