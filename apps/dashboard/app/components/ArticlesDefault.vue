<template>
  <section class="articles articles--default">
    <div class="articles--default__container">
      <div class="articles--default__header">
        <SearchDefault
          :model-value="settingsStore.articles.searchTerm"
          placeholder="Buscar artículos..."
          class="articles--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="articles--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="articles--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="article in paginatedArticles" :key="article.id">
            <TableCell>{{ article.id }}</TableCell>
            <TableCell>
              <div
                v-if="article.title"
                v-tooltip="article.title.length > 60 ? article.title : ''"
                class="articles--default__title"
              >
                {{ truncateText(article.title, 60) }}
              </div>
              <div v-else class="articles--default__title">-</div>
            </TableCell>
            <TableCell>
              <BadgeDefault v-if="article.publishedAt" variant="default">
                Publicado
              </BadgeDefault>
              <BadgeDefault v-else variant="outline"> Borrador </BadgeDefault>
            </TableCell>
            <TableCell>{{ formatDate(article.updatedAt) }}</TableCell>
            <TableCell align="right">
              <div class="articles--default__actions">
                <button
                  class="articles--default__action"
                  title="Ver artículo"
                  @click="handleViewArticle(article)"
                >
                  <Eye class="articles--default__action__icon" />
                </button>
                <button
                  class="articles--default__action"
                  title="Editar artículo"
                  @click="handleEditArticle(article)"
                >
                  <Pencil class="articles--default__action__icon" />
                </button>
                <button
                  class="articles--default__action articles--default__action--danger"
                  title="Eliminar artículo"
                  @click="handleDeleteArticle(article)"
                >
                  <Trash2 class="articles--default__action__icon" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedArticles.length === 0 && !loading"
          class="articles--default__empty"
        >
          <p>No se encontraron artículos</p>
        </div>

        <div v-if="loading" class="articles--default__loading">
          <p>Cargando artículos...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.articles.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.articles.pageSize"
        class="articles--default__pagination"
        @page-change="
          (page: number) => settingsStore.setCurrentPage(section, page)
        "
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye, Pencil, Trash2 } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

interface Article {
  id: number;
  documentId?: string;
  title: string;
  publishedAt: string | null;
  updatedAt: string;
}

const settingsStore = useSettingsStore();
const section = "articles" as const;

const filters = computed(() => settingsStore.getArticlesFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const allArticles = ref<Article[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const { Swal } = useSweetAlert2();
const strapi = useStrapi();
const router = useRouter();

const fetchArticles = async () => {
  try {
    loading.value = true;

    const searchParams: Record<string, unknown> = {
      pagination: {
        page: settingsStore.articles.currentPage,
        pageSize: settingsStore.articles.pageSize,
      },
      sort: settingsStore.articles.sortBy,
    };

    if (settingsStore.articles.searchTerm) {
      searchParams.filters = {
        title: { $containsi: settingsStore.articles.searchTerm },
      };
    }

    const response = await strapi.find("articles", searchParams);
    allArticles.value = Array.isArray(response.data)
      ? (response.data as Article[])
      : [];
    paginationMeta.value = (response.meta?.pagination ||
      null) as typeof paginationMeta.value;
  } catch (error) {
    console.error("Error fetching articles:", error);
    allArticles.value = [];
  } finally {
    loading.value = false;
  }
};

const handleDeleteArticle = async (article: Article) => {
  const result = await Swal.fire({
    title: "¿Eliminar artículo?",
    text: `"${article.title}" será eliminado permanentemente.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });
  if (!result.isConfirmed) return;
  try {
    await strapi.delete("articles", article.documentId || String(article.id));
    await fetchArticles();
    await Swal.fire("Eliminado", "El artículo fue eliminado.", "success");
  } catch {
    await Swal.fire("Error", "No se pudo eliminar el artículo.", "error");
  }
};

const paginatedArticles = computed(() => allArticles.value);

const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

const tableColumns = [
  { label: "ID" },
  { label: "Título" },
  { label: "Estado" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "title:asc", label: "Título A-Z" },
  { value: "title:desc", label: "Título Z-A" },
];

const truncateText = (text: string, maxLength: number) => {
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength)) + "...";
};

const handleViewArticle = (article: Article) => {
  router.push(`/articles/${article.documentId || article.id}`);
};

const handleEditArticle = (article: Article) => {
  router.push(`/articles/${article.documentId || article.id}/edit`);
};

watch(
  [
    () => settingsStore.articles.searchTerm,
    () => settingsStore.articles.sortBy,
    () => settingsStore.articles.pageSize,
    () => settingsStore.articles.currentPage,
  ],
  () => {
    fetchArticles();
  },
  { immediate: true },
);
</script>
