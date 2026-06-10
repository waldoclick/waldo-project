<template>
  <div>
    <HeroHeaderDashboard title="Artículos" :breadcrumbs="breadcrumbs">
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
    </HeroHeaderDashboard>
    <ArticlesDefault ref="articlesRef" />
    <LightBoxArticles
      :is-open="isLightboxOpen"
      @close="isLightboxOpen = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Wand2 } from "lucide-vue-next";
import ArticlesDefault from "@/components/ArticlesDefault.vue";
import LightBoxArticles from "@/components/LightBoxArticles.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Artículos" }];
const isLightboxOpen = ref(false);
const articlesRef = ref<InstanceType<typeof ArticlesDefault> | null>(null);

function handleCreated() {
  articlesRef.value?.fetchArticles();
}
</script>
