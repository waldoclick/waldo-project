<template>
  <div v-if="pageData?.article" class="page">
    <HeaderDefault />
    <HeroArticle
      :title="pageData.article.title"
      :category-name="pageData.article.categories[0]?.name || ''"
      :category-slug="pageData.article.categories[0]?.slug || ''"
      :published-at="pageData.article.publishedAt"
    />
    <ArticleSingle :article="pageData.article" />
    <RelatedArticles
      v-if="pageData.relatedArticles.length > 0"
      :articles="pageData.relatedArticles"
      :loading="false"
      :error="null"
      title="Artículos relacionados"
      text="Más contenido que puede interesarte"
      :center-head="true"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
definePageMeta({});

const { $setSEO, $setStructuredData } = useNuxtApp() as unknown as {
  $setSEO: (data: {
    title: string;
    description: string;
    imageUrl: string;
    url: string;
  }) => void;
  $setStructuredData: (data: object) => void;
};
const config = useRuntimeConfig();

import { ref, watch, watchEffect } from "vue";
import { useRoute } from "nuxt/app";
import { useArticlesStore } from "@/stores/articles.store";
import type { Article } from "@/types/article";

import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import HeroArticle from "@/components/HeroArticle.vue";
import ArticleSingle from "@/components/ArticleSingle.vue";
import RelatedArticles from "@/components/RelatedArticles.vue";

interface ArticlePageData {
  article: Article | null;
  relatedArticles: Article[];
}

const route = useRoute();

const { data: pageData, pending } = await useAsyncData<ArticlePageData>(
  () => `article-${route.params.slug}`,
  async () => {
    const articlesStore = useArticlesStore();
    const slug = route.params.slug as string;

    // Fetch main article by slug
    await articlesStore.loadArticles(
      { slug: { $eq: slug } } as Record<string, unknown>,
      { page: 1, pageSize: 1 },
      [],
    );

    const article = articlesStore.articles[0] || null;

    if (!article) {
      return { article: null, relatedArticles: [] };
    }

    // Load related articles: same-category first, fallback to most recent
    await articlesStore.loadArticles(
      {
        categories: { slug: { $eq: article.categories?.[0]?.slug } },
        slug: { $ne: article.slug },
      } as unknown as Record<string, unknown>,
      { page: 1, pageSize: 6 },
      ["publishedAt:desc"],
    );
    let related = articlesStore.articles;

    // If fewer than 3, top up with most recent (excluding current article)
    if (related.length < 3) {
      const existingIds = new Set(related.map((a) => a.id));
      await articlesStore.loadArticles(
        { slug: { $ne: article.slug } } as Record<string, unknown>,
        { page: 1, pageSize: 6 },
        ["publishedAt:desc"],
      );
      const fill = articlesStore.articles.filter((a) => !existingIds.has(a.id));
      related = [...related, ...fill].slice(0, 6);
    }

    return { article, relatedArticles: related };
  },
  {
    server: true,
    default: () => ({ article: null, relatedArticles: [] }),
  },
);

// Show 404 when data is done loading but no article was found
watchEffect(() => {
  if (!pending.value && (!pageData.value || !pageData.value.article)) {
    showError({
      statusCode: 404,
      message: "Artículo no encontrado",
      statusMessage:
        "Lo sentimos, el artículo que buscas no existe o no está disponible.",
    });
  }
});

// Set SEO and structured data when article data is available
watch(
  () => pageData.value,
  (newData) => {
    if (newData?.article) {
      const article = newData.article;
      const imageUrl =
        article.cover?.[0]?.formats?.medium?.url ||
        article.cover?.[0]?.formats?.thumbnail?.url ||
        `${config.public.baseUrl}/share.jpg`;

      $setSEO({
        title: `${article.seo_title || article.title} — Blog — Waldo.click®`,
        description: article.seo_description || article.header,
        imageUrl,
        url: `${config.public.baseUrl}/blog/${route.params.slug}`,
      });

      $setStructuredData({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        name: article.seo_title || article.title,
        description: article.seo_description || article.header,
        image: imageUrl,
        datePublished: article.publishedAt || article.createdAt,
        author: {
          "@type": "Organization",
          name: "Waldo.click®",
        },
        url: `${config.public.baseUrl}/blog/${route.params.slug}`,
      });
    }
  },
  { immediate: true },
);

const { articleView } = useAdAnalytics();
const articleViewFired = ref(false);

// Reset guard when slug changes (Nuxt reuses this component across slug navigations)
watch(
  () => route.params.slug,
  () => {
    articleViewFired.value = false;
  },
);

// Fire article_view once per article load
watch(
  () => pageData.value,
  (newData) => {
    if (newData?.article && !articleViewFired.value) {
      articleViewFired.value = true;
      const article = newData.article;
      articleView(
        article.id,
        article.title,
        article.categories[0]?.name || "Unknown",
      );
    }
  },
  { immediate: true },
);
</script>
