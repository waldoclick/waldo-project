<template>
  <section class="hero hero--dashboard">
    <div class="hero--dashboard__container">
      <div class="hero--dashboard__content">
        <h1 class="hero--dashboard__title">{{ greeting }}, {{ userName }}!</h1>
        <div class="hero--dashboard__bottom">
          <p class="hero--dashboard__subtitle">
            Aquí está lo que está pasando con tus anuncios hoy
          </p>
          <div class="hero--dashboard__stats">
            <StatsDefault />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import StatsDefault from "@/components/StatsDefault.vue";

const user = useStrapiUser();

const userName = computed(() => {
  return (user.value as any)?.firstname || "Usuario";
});

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Buenos días";
  } else if (hour < 19) {
    return "Buenas tardes";
  } else {
    return "Buenas noches";
  }
});
</script>
