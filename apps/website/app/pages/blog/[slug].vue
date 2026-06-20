<template>
  <div v-if="pageData?.article" class="page">
    <HeaderDefault />
    <ArticleSingle
      :article="pageData.article"
      :featured-ads="pageData.featuredAds"
      :related-articles="pageData.relatedArticles"
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
import type { FeaturedAd } from "@/types/featured-ad";

import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import ArticleSingle from "@/components/ArticleSingle.vue";

interface ArticlePageData {
  article: Article | null;
  relatedArticles: Article[];
  featuredAds: FeaturedAd[];
}

const route = useRoute();

// useApiClient MUST be created at setup top-level (before any await). Calling it
// after the awaits inside the useAsyncData handler reads the Nuxt request context
// outside a valid instance and breaks the SSR fetch.
const apiClient = useApiClient();

// Featured ads for the sticky aside — fetched directly and reduced to a flat,
// plain shape. Returning full ad records (populate:*) into this page's payload
// trips devalue ("obj.hasOwnProperty is not a function"); primitives are safe.
const fetchFeaturedAds = async (): Promise<FeaturedAd[]> => {
  try {
    const res = (await apiClient("ads/catalog", {
      method: "GET",
      params: {
        filters: {},
        pagination: { page: 1, pageSize: 4 },
        sort: ["sort_priority:asc", "createdAt:desc"],
        populate: "*",
      } as unknown as Record<string, unknown>,
    })) as { data: RawFeaturedAd[] };
    return (res.data ?? []).map((ad) => ({
      slug: ad.slug,
      name: ad.name,
      price: ad.price ?? null,
      categoryName:
        typeof ad.category === "object" && ad.category !== null
          ? ad.category.name || ""
          : "",
      image:
        ad.gallery?.[0]?.formats?.medium?.url || ad.gallery?.[0]?.url || "",
    }));
  } catch {
    return [];
  }
};

interface RawFeaturedAd {
  slug: string;
  name: string;
  price?: number | null;
  category?: { name?: string } | number | null;
  gallery?: { url?: string; formats?: { medium?: { url?: string } } }[];
}

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
      return { article: null, relatedArticles: [], featuredAds: [] };
    }

    // Load related articles: same-category first, fallback to most recent
    await articlesStore.loadArticles(
      {
        categories: { slug: { $eq: article.categories?.[0]?.slug } },
        slug: { $ne: article.slug },
      } as unknown as Record<string, unknown>,
      { page: 1, pageSize: 6 },
      ["createdAt:desc"],
    );
    let related = articlesStore.articles;

    // If fewer than 3, top up with most recent (excluding current article)
    if (related.length < 3) {
      const existingIds = new Set(related.map((a) => a.id));
      await articlesStore.loadArticles(
        { slug: { $ne: article.slug } } as Record<string, unknown>,
        { page: 1, pageSize: 6 },
        ["createdAt:desc"],
      );
      const fill = articlesStore.articles.filter((a) => !existingIds.has(a.id));
      related = [...related, ...fill].slice(0, 6);
    }

    const featuredAds = await fetchFeaturedAds();

    return { article, relatedArticles: related, featuredAds };
  },
  {
    server: true,
    default: () => ({ article: null, relatedArticles: [], featuredAds: [] }),
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
