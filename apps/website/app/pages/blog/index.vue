<template>
  <div class="page">
    <HeaderDefault />
    <HeroDefault
      :breadcrumbs="[{ label: 'Blog' }]"
      subtitle="Guías de compra y venta, lectura de mercado, mantención y logística. Todo lo que necesitas saber para mover maquinaria con confianza."
    >
      <template #eyebrow>
        <span class="hero--default__eyebrow">
          <IconBook :size="15" />
          Blog Waldo
        </span>
      </template>
      <template #title>Activos industriales, explicados</template>
    </HeroDefault>
    <FilterArticles
      v-if="blogData && blogData.articles && blogData.articles.length > 0"
      :categories="blogData.categories"
    />
    <ArticleArchive
      v-if="blogData && blogData.articles && blogData.articles.length > 0"
      :articles="blogData.articles"
      :pagination="blogData.pagination"
      :grid-blog="true"
    />
    <MessageDefault
      v-if="blogData && blogData.articles && blogData.articles.length === 0"
      type="fail"
      title="No hay artículos con esos filtros"
      description="Prueba ajustando tu búsqueda o mira lo que tenemos disponible"
      button_label="Ver todos los artículos"
      button_link="/blog"
      :button_show="true"
    />
    <RelatedArticles
      v-if="
        blogData &&
        blogData.articles &&
        blogData.articles.length === 0 &&
        blogData.relatedArticles &&
        blogData.relatedArticles.length > 0
      "
      :articles="blogData.relatedArticles"
      :loading="blogData.relatedLoading"
      :error="blogData.relatedError || null"
      title="Artículos recientes"
      text="Los últimos artículos del blog"
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

import { watch } from "vue";
import { useRoute } from "nuxt/app";
import { useBlogCategoriesStore } from "@/stores/blog-categories.store";
import { useArticlesStore } from "@/stores/articles.store";

import { BookOpen as IconBook } from "lucide-vue-next";

// Components
import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroDefault from "@/components/HeroDefault.vue";
import FilterArticles from "@/components/FilterArticles.vue";
import ArticleArchive from "@/components/ArticleArchive.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import RelatedArticles from "@/components/RelatedArticles.vue";
import MessageDefault from "@/components/MessageDefault.vue";

// Types
import type { Article } from "@/types/article";
import type { BlogCategory } from "@/types/blog-category";
import type { Pagination } from "@/types/pagination";

interface BlogData {
  articles: Article[];
  pagination: Pagination;
  categories: BlogCategory[];
  relatedArticles: Article[];
  relatedLoading: boolean;
  relatedError: string | null;
}

const route = useRoute();

const { data: blogData } = await useAsyncData<BlogData>(
  () =>
    `blog-${route.query.category || "all"}-${route.query.page || "1"}-${route.query.q || ""}`,
  async () => {
    const blogCategoriesStore = useBlogCategoriesStore();
    const articlesStore = useArticlesStore();

    await blogCategoriesStore.loadBlogCategories();
    articlesStore.reset();

    const category = route.query.category?.toString() || null;
    const page = Number.parseInt(route.query.page?.toString() || "1", 10);
    const query = route.query.q?.toString().trim() || null;

    const sortParams = ["createdAt:desc"];

    const filtersParams: Record<string, unknown> = {
      ...(category && { blog_categories: { slug: { $eq: category } } }),
      ...(query && {
        $or: [
          { title: { $containsi: query } },
          { header: { $containsi: query } },
        ],
      }),
    };

    await articlesStore.loadArticles(
      filtersParams,
      { page, pageSize: 12 },
      sortParams,
    );
    const mainArticles = articlesStore.articles;
    const mainPagination = articlesStore.pagination;

    let relatedArticles: Article[] = [];
    let relatedLoading = false;
    let relatedError: string | null = null;

    if (mainArticles.length === 0 && mainPagination.total === 0) {
      relatedLoading = true;
      try {
        await articlesStore.loadArticles({}, { page: 1, pageSize: 12 }, [
          "createdAt:desc",
        ]);
        relatedArticles = articlesStore.articles;
      } catch (err) {
        relatedError = err instanceof Error ? err.message : String(err);
      }
      relatedLoading = false;
    }

    return {
      articles: mainArticles,
      pagination: mainPagination,
      categories: blogCategoriesStore.categories,
      relatedArticles,
      relatedLoading,
      relatedError,
    };
  },
  {
    watch: [
      () => route.query.category,
      () => route.query.page,
      () => route.query.q,
    ],
    server: true,
    default: () => ({
      articles: [],
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
      categories: [],
      relatedArticles: [],
      relatedLoading: false,
      relatedError: null,
    }),
  },
);

const generateSEOTitle = () => {
  const categorySlug = route.query.category?.toString();
  if (categorySlug && blogData.value) {
    const categoryName = blogData.value.categories.find(
      (c) => c.slug === categorySlug,
    )?.name;
    if (categoryName) return `${categoryName} — Blog — Waldo.click®`;
  }
  return "Blog — Waldo.click®";
};

const generateSEODescription = () => {
  return "Artículos sobre activos industriales, consejos y novedades del sector. Lee las últimas publicaciones en Waldo.click®.";
};

if (blogData.value) {
  $setSEO({
    title: generateSEOTitle(),
    description: generateSEODescription(),
    imageUrl: `${config.public.baseUrl}/share.jpg`,
    url: `${config.public.baseUrl}${route.fullPath}`,
  });

  $setStructuredData({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: generateSEOTitle(),
    description: generateSEODescription(),
    url: `${config.public.baseUrl}${route.fullPath}`,
  });
}

watch(
  [() => blogData.value, () => route.query],
  () => {
    if (blogData.value) {
      $setSEO({
        title: generateSEOTitle(),
        description: generateSEODescription(),
        imageUrl: `${config.public.baseUrl}/share.jpg`,
        url: `${config.public.baseUrl}${route.fullPath}`,
      });

      $setStructuredData({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: generateSEOTitle(),
        description: generateSEODescription(),
        url: `${config.public.baseUrl}${route.fullPath}`,
      });
    }
  },
  { immediate: true },
);
</script>
