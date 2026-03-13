<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/articles/${route.params.id}/edit`"
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
          <CardInfo v-if="article" title="Cuerpo" :description="article.body" />
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

interface ArticleData {
  id?: number;
  documentId?: string;
  title?: string;
  header?: string;
  body?: string;
  seo_title?: string;
  seo_description?: string;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const article = ref<ArticleData | null>(null);

const title = computed(() => article.value?.title || "Artículo");
const breadcrumbs = computed(() => [
  { label: "Artículos", to: "/articles" },
  ...(article.value?.title ? [{ label: article.value.title }] : []),
]);

const { data: articleData } = await useAsyncData(
  `article-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const strapi = useStrapi();
    const response = await strapi.find("articles", {
      filters: { documentId: { $eq: id } },
    } as Record<string, unknown>);
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data as ArticleData;

    const fallbackResponse = await strapi.findOne("articles", id as string);
    return (fallbackResponse.data as unknown as ArticleData) || null;
  },
);

article.value = (articleData.value as ArticleData) ?? null;
</script>
