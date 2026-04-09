<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/maintenance/articles/${route.params.id}/edit`"
        >
          Editar artículo
        </NuxtLink>
      </template>
    </HeroDefault>
    <BoxContent>
      <template #content>
        <BoxInformation title="Información" :columns="1">
          <CardInfo
            v-if="article"
            title="Título"
            :description="article.title"
          />
          <CardInfo
            v-if="article"
            title="Encabezado"
            :description="article.header"
          />
          <article v-if="article && article.body" class="card card--info">
            <div class="card--info__title">Cuerpo</div>
            <div class="card--info__description">
              <div class="card--info__description__text article-body-preview">
                {{ article.body }}
              </div>
            </div>
          </article>
          <CardInfo
            v-if="article"
            title="Título SEO"
            :description="article.seo_title"
          />
          <CardInfo
            v-if="article"
            title="Descripción SEO"
            :description="article.seo_description"
          />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="article"
            title="Fecha de creación"
            :description="formatDate(article.createdAt)"
          />
          <CardInfo
            v-if="article"
            title="Última modificación"
            :description="formatDate(article.updatedAt)"
          />
          <CardInfo
            v-if="article"
            title="Estado"
            :description="article.publishedAt ? 'Publicado' : 'Borrador'"
          />
          <article v-if="article && article.source_url" class="card card--info">
            <div class="card--info__title">Fuente</div>
            <div class="card--info__description">
              <a
                :href="article.source_url"
                target="_blank"
                rel="noopener noreferrer"
                class="card--info__description__text"
                >{{ article.source_url }}</a
              >
            </div>
          </article>
        </BoxInformation>
        <BoxInformation
          v-if="coverImages.length > 0"
          title="Portada"
          :columns="1"
        >
          <GalleryDefault
            :images="coverImages"
            alt-prefix="Portada"
            :columns="1"
            @image-delete="() => {}"
          />
        </BoxInformation>
        <BoxInformation
          v-if="galleryImages.length > 0"
          title="Galería"
          :columns="1"
        >
          <GalleryDefault
            :images="galleryImages"
            alt-prefix="Galería"
            :columns="2"
            @image-delete="() => {}"
          />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";
import GalleryDefault from "@/components/GalleryDefault.vue";

interface MediaItem {
  id?: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

interface ArticleData {
  id?: number;
  documentId?: string;
  title?: string;
  header?: string;
  body?: string;
  seo_title?: string;
  seo_description?: string;
  source_url?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  cover?: MediaItem | MediaItem[] | null;
  gallery?: MediaItem[];
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const article = ref<ArticleData | null>(null);
const apiClient = useApiClient();

const title = computed(() => article.value?.title || "Artículo");
const breadcrumbs = computed(() => [
  { label: "Artículos", to: "/maintenance/articles" },
  ...(article.value?.title ? [{ label: article.value.title }] : []),
]);

const { data: articleData } = await useAsyncData(
  `article-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("articles", {
      method: "GET",
      params: {
        filters: { documentId: { $eq: id } },
        populate: ["cover", "gallery"],
      } as unknown as Record<string, unknown>,
    })) as { data: ArticleData[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data as ArticleData;

    const fallback = (await apiClient(`articles/${id}`, {
      method: "GET",
      params: { populate: ["cover", "gallery"] } as unknown as Record<
        string,
        unknown
      >,
    })) as { data: ArticleData };
    return (fallback.data as unknown as ArticleData) || null;
  },
);

article.value = (articleData.value as ArticleData) ?? null;

const coverImages = computed<MediaItem[]>(() => {
  const cover = article.value?.cover;
  if (!cover) return [];
  return Array.isArray(cover) ? cover : [cover];
});

const galleryImages = computed<MediaItem[]>(() => article.value?.gallery ?? []);
</script>

<style scoped>
.article-body-preview {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
}
</style>
