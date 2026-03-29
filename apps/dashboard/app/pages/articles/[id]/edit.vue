<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar artículo" :columns="1">
          <FormArticle :article="article" @saved="handleArticleSaved" />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Acciones" :columns="1">
          <button
            v-if="article"
            type="button"
            class="btn btn--buy btn--block"
            :disabled="publishing"
            @click="handleTogglePublish"
          >
            {{ article.publishedAt ? "Volver a borrador" : "Publicar" }}
          </button>
        </BoxInformation>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="article"
            title="Estado"
            :description="article.publishedAt ? 'Publicado' : 'Borrador'"
          />
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
import FormArticle from "@/components/FormArticle.vue";

interface MediaItem {
  id?: number;
  url?: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
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
  cover?: MediaItem[];
  gallery?: MediaItem[];
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const strapi = useStrapi();
const apiClient = useApiClient();
const { Swal } = useSweetAlert2();

const article = ref<ArticleData | null>(null);
const publishing = ref(false);

const title = computed(() => article.value?.title || "Artículo");
const breadcrumbs = computed(() => [
  { label: "Artículos", to: "/articles" },
  ...(article.value?.title
    ? [{ label: article.value.title, to: `/articles/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const handleArticleSaved = (updatedArticle: ArticleData) => {
  if (updatedArticle) {
    article.value = updatedArticle;
  }
};

const handleTogglePublish = async () => {
  if (!article.value) return;
  const documentId =
    article.value.documentId ||
    (typeof route.params.id === "string" ? route.params.id : undefined);
  if (!documentId) return;

  publishing.value = true;
  try {
    const newPublishedAt = article.value.publishedAt
      ? null
      : new Date().toISOString();

    await apiClient(`/articles/${documentId}`, {
      method: "PUT",
      body: { data: { publishedAt: newPublishedAt } },
    });

    article.value = { ...article.value, publishedAt: newPublishedAt };

    await Swal.fire(
      "Éxito",
      newPublishedAt
        ? "Artículo publicado."
        : "Artículo guardado como borrador.",
      "success",
    );
  } catch (error) {
    console.error("Error toggling publish state:", error);
    await Swal.fire(
      "Error",
      "No se pudo cambiar el estado del artículo.",
      "error",
    );
  } finally {
    publishing.value = false;
  }
};

const { data: articleData } = await useAsyncData(
  `article-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = await strapi.find("articles", {
      filters: { documentId: { $eq: id } },
      populate: ["cover", "gallery"],
    } as Record<string, unknown>);
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data as ArticleData;

    const fallbackResponse = await strapi.findOne(
      "articles",
      id as string,
      {
        populate: ["cover", "gallery"],
      } as Record<string, unknown>,
    );
    return (fallbackResponse.data as unknown as ArticleData) || null;
  },
);

article.value = (articleData.value as ArticleData) ?? null;
</script>
