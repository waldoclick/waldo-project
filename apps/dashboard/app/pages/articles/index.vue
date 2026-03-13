<template>
  <div>
    <HeroDefault title="Artículos" :breadcrumbs="breadcrumbs">
      <template #actions>
        <button
          class="btn btn--announcement"
          type="button"
          @click="isLightboxOpen = true"
        >
          <Wand2 :size="16" />
          Generar artículo
        </button>
        <NuxtLink class="btn btn--primary" to="/articles/new">
          Agregar artículo
        </NuxtLink>
      </template>
    </HeroDefault>
    <ArticlesDefault />
    <LightBoxArticles
      :is-open="isLightboxOpen"
      @close="isLightboxOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Wand2 } from "lucide-vue-next";
import HeroDefault from "@/components/HeroDefault.vue";
import ArticlesDefault from "@/components/ArticlesDefault.vue";
import LightBoxArticles from "@/components/LightBoxArticles.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Artículos" }];
const isLightboxOpen = ref(false);
</script>
