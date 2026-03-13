import { defineStore } from "pinia";
import { ref } from "vue";

export interface IAIArticleCache {
  sourceUrl: string;
  result: {
    title: string;
    header: string;
    body: string;
    seo_title: string;
    seo_description: string;
  };
  cachedAt: number;
}

export const useArticlesStore = defineStore("articles", () => {
  // State — keyed by source URL string
  const aiCache = ref<Record<string, IAIArticleCache>>({});

  // Getters
  function getAICache(sourceUrl: string): IAIArticleCache | null {
    return aiCache.value[sourceUrl] ?? null;
  }

  function hasAICache(sourceUrl: string): boolean {
    const entry = aiCache.value[sourceUrl];
    return sourceUrl in aiCache.value && entry !== undefined;
  }

  // Actions
  function setAICache(
    sourceUrl: string,
    result: IAIArticleCache["result"],
  ): void {
    aiCache.value[sourceUrl] = { sourceUrl, result, cachedAt: Date.now() };
  }

  return {
    aiCache,
    getAICache,
    hasAICache,
    setAICache,
  };
  // No persist — session-only cache (intentional)
});
