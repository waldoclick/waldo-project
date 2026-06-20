<template>
  <div class="article article--single">
    <!-- Breadcrumb bar -->
    <section class="article--single__breadcrumb">
      <div class="article--single__breadcrumb__inner">
        <nav
          class="article--single__breadcrumb__nav"
          aria-label="Ruta de navegación"
        >
          <NuxtLink to="/" class="article--single__breadcrumb__nav__link"
            >Waldo</NuxtLink
          >
          <ChevronRight
            :size="14"
            class="article--single__breadcrumb__nav__sep"
          />
          <NuxtLink to="/blog" class="article--single__breadcrumb__nav__link"
            >Blog</NuxtLink
          >
          <template v-if="categoryName">
            <ChevronRight
              :size="14"
              class="article--single__breadcrumb__nav__sep"
            />
            <span class="article--single__breadcrumb__nav__current">{{
              categoryName
            }}</span>
          </template>
        </nav>
        <NuxtLink to="/blog" class="article--single__breadcrumb__back">
          <ArrowLeft :size="15" />
          Volver al blog
        </NuxtLink>
      </div>
    </section>

    <!-- Grid: article + aside -->
    <section class="article--single__layout">
      <div class="article--single__grid">
        <article class="article--single__main">
          <span
            v-if="categoryName"
            class="article--single__main__badge"
            :style="{ color: hue.onColor }"
          >
            <span
              class="article--single__main__badge__dot"
              :style="{ background: hue.baseColor }"
            ></span>
            {{ categoryName }}
          </span>

          <h1 class="article--single__main__title">{{ article.title }}</h1>

          <p v-if="article.header" class="article--single__main__excerpt">
            {{ article.header }}
          </p>

          <div class="article--single__main__meta">
            <span class="article--single__main__meta__author">
              <span class="article--single__main__meta__author__avatar">W</span>
              <span class="article--single__main__meta__author__name"
                >Waldo</span
              >
            </span>
            <span class="article--single__main__meta__sep"></span>
            <span class="article--single__main__meta__date">{{
              formattedDate
            }}</span>
            <span class="article--single__main__meta__sep"></span>
            <span class="article--single__main__meta__read">
              <Clock
                :size="14"
                class="article--single__main__meta__read__icon"
              />
              {{ getReadTime(article.body) }} min de lectura
            </span>
          </div>

          <div v-if="hasCover" class="article--single__main__cover">
            <NuxtImg
              :src="coverImage"
              :alt="article.title"
              width="720"
              height="405"
              format="webp"
              remote
            />
          </div>

          <div
            class="article--single__readmore"
            :class="{ 'article--single__readmore--expanded': expanded }"
          >
            <div class="article--single__body">
              <div
                class="article--single__body__text"
                v-html="parseMarkdown(article.body)"
              />
            </div>
            <div v-if="!expanded" class="article--single__readmore__fade"></div>
            <div v-if="!expanded" class="article--single__readmore__more">
              <button
                type="button"
                class="article--single__readmore__more__button"
                @click="expanded = true"
              >
                Leer más en el artículo
                <ArrowDown :size="16" />
              </button>
              <span class="article--single__readmore__more__label">
                {{ getReadTime(article.body) }} min de lectura
              </span>
            </div>
          </div>

          <!-- Footer: feedback / share / more -->
          <div class="article--single__footer">
            <div class="article--single__footer__feedback">
              <span class="article--single__footer__feedback__label"
                >¿Te sirvió este artículo?</span
              >
              <button
                type="button"
                class="article--single__footer__feedback__share"
                @click="copyLink"
              >
                <template v-if="copied">
                  <Check
                    :size="15"
                    class="article--single__footer__feedback__share__ok"
                  />
                  Enlace copiado
                </template>
                <template v-else>
                  <Share2 :size="15" />
                  Compartir
                </template>
              </button>
            </div>
            <NuxtLink to="/blog" class="article--single__footer__more">
              Ver más artículos
              <ArrowRight :size="15" />
            </NuxtLink>
          </div>
        </article>

        <aside class="article--single__aside">
          <!-- Featured ads -->
          <div class="article--single__aside__featured">
            <span class="article--single__aside__featured__eyebrow">
              <span
                class="article--single__aside__featured__eyebrow__dot"
              ></span>
              Destacados en Waldo
            </span>
            <div class="article--single__aside__featured__list">
              <NuxtLink
                v-for="row in featuredRows"
                :key="row.slug"
                :to="`/anuncios/${row.slug}`"
                class="article--single__aside__featured__row"
              >
                <span class="article--single__aside__featured__row__thumb">
                  <img v-if="row.image" :src="row.image" :alt="row.name" />
                </span>
                <span class="article--single__aside__featured__row__info">
                  <span
                    v-if="row.category"
                    class="article--single__aside__featured__row__cat"
                    :style="{ color: row.hue.onColor }"
                  >
                    <span
                      class="article--single__aside__featured__row__cat__dot"
                      :style="{ background: row.hue.baseColor }"
                    ></span>
                    {{ row.category }}
                  </span>
                  <span class="article--single__aside__featured__row__title">{{
                    row.name
                  }}</span>
                  <span class="article--single__aside__featured__row__price">{{
                    row.price
                  }}</span>
                </span>
              </NuxtLink>
            </div>
            <NuxtLink
              to="/anuncios"
              class="article--single__aside__featured__link"
            >
              Ver todos los avisos
              <ArrowRight :size="14" />
            </NuxtLink>
          </div>

          <!-- Sell CTA -->
          <div class="article--single__aside__cta">
            <h4 class="article--single__aside__cta__title">¿Vendes equipos?</h4>
            <p class="article--single__aside__cta__text">
              Publica tu aviso y llega a compradores de todo Chile. Los primeros
              3 son gratis.
            </p>
            <NuxtLink
              to="/anunciar"
              class="article--single__aside__cta__button"
            >
              Publicar aviso
              <ArrowRight :size="15" />
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>

    <!-- Sigue leyendo -->
    <section v-if="relatedArticles.length > 0" class="article--single__related">
      <div class="article--single__related__inner">
        <h2 class="article--single__related__title">Sigue leyendo</h2>
        <div class="article--single__related__grid">
          <CardArticle
            v-for="related in relatedArticles.slice(0, 3)"
            :key="related.id"
            :article="related"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Article } from "@/types/article";
import type { FeaturedAd } from "@/types/featured-ad";
import { useSanitize } from "@/composables/useSanitize";
import { useImageProxy } from "@/composables/useImage";
import { getReadTime } from "@/utils/readTime";
import { getCategoryHue } from "@/utils/categoryHue";
import { formatCurrency } from "@/utils/price";
import CardArticle from "@/components/CardArticle.vue";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Clock,
  Share2,
  Check,
} from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    article: Article;
    featuredAds?: FeaturedAd[];
    relatedArticles?: Article[];
  }>(),
  { featuredAds: () => [], relatedArticles: () => [] },
);

const { parseMarkdown } = useSanitize();
const { transformUrl } = useImageProxy();

// Collapsed by default so SSR and hydration both render the same (no mismatch).
const expanded = ref(false);

const categoryName = computed(
  () =>
    props.article.blog_categories?.[0]?.name ||
    props.article.categories?.[0]?.name ||
    "",
);
const hue = computed(() => getCategoryHue(categoryName.value));

const hasCover = computed(() => {
  const cover = props.article.cover;
  return cover && cover.length > 0;
});

const coverImage = computed(() => {
  const cover = props.article.cover;
  const firstImage =
    cover?.[0]?.formats?.medium?.url ||
    cover?.[0]?.formats?.thumbnail?.url ||
    "";
  return transformUrl(firstImage);
});

const formattedDate = computed(() => {
  if (!props.article.createdAt) return "";
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(props.article.createdAt));
});

// Featured-ad rows for the sticky aside
const featuredRows = computed(() =>
  props.featuredAds.slice(0, 4).map((ad) => ({
    slug: ad.slug,
    name: ad.name,
    image: ad.image ? transformUrl(ad.image) : "",
    category: ad.categoryName,
    hue: getCategoryHue(ad.categoryName),
    price: formatCurrency(ad.price),
  })),
);

// Share — copy the current URL to the clipboard with a transient confirmation
const copied = ref(false);
const copyLink = async () => {
  try {
    if (import.meta.client) {
      await navigator.clipboard.writeText(window.location.href);
      copied.value = true;
      setTimeout(() => (copied.value = false), 2000);
    }
  } catch {
    // clipboard unavailable — silently ignore
  }
};
</script>
