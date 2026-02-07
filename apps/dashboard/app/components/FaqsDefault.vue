<template>
  <section class="faqs faqs--default">
    <div class="faqs--default__container">
      <div class="faqs--default__header">
        <SearchDefault
          :model-value="settingsStore.faqs.searchTerm"
          placeholder="Buscar FAQs..."
          class="faqs--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="faqs--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="faqs--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="faq in paginatedFaqs" :key="faq.id">
            <TableCell>{{ faq.id }}</TableCell>
            <TableCell>
              <div
                v-if="faq.title"
                v-tooltip="
                  stripHtml(faq.title).length > 60 ? stripHtml(faq.title) : ''
                "
                class="faqs--default__question"
              >
                {{ truncateText(faq.title, 60) }}
              </div>
              <div v-else class="faqs--default__question">-</div>
            </TableCell>
            <TableCell>
              <div
                v-if="faq.text"
                v-tooltip="
                  stripHtml(faq.text).length > 80 ? stripHtml(faq.text) : ''
                "
                class="faqs--default__answer"
              >
                {{ truncateText(faq.text, 80) }}
              </div>
              <div v-else class="faqs--default__answer">-</div>
            </TableCell>
            <TableCell>
              <BadgeDefault v-if="faq.featured" variant="default">
                Destacado
              </BadgeDefault>
              <BadgeDefault v-else variant="outline">
                No destacado
              </BadgeDefault>
            </TableCell>
            <TableCell>{{ formatDate(faq.updatedAt) }}</TableCell>
            <TableCell align="right">
              <div class="faqs--default__actions">
                <button
                  class="faqs--default__action"
                  title="Ver FAQ"
                  @click="handleViewFaq(faq.id)"
                >
                  <Eye class="faqs--default__action__icon" />
                </button>
                <button
                  class="faqs--default__action"
                  title="Editar FAQ"
                  @click="handleEditFaq(faq.id)"
                >
                  <Pencil class="faqs--default__action__icon" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedFaqs.length === 0 && !loading"
          class="faqs--default__empty"
        >
          <p>No se encontraron FAQs</p>
        </div>

        <div v-if="loading" class="faqs--default__loading">
          <p>Cargando FAQs...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.faqs.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.faqs.pageSize"
        class="faqs--default__pagination"
        @page-change="
          (page: number) => settingsStore.setCurrentPage(section, page)
        "
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye, Pencil } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

interface Faq {
  id: number;
  title: string;
  text: string;
  featured: boolean;
  updatedAt: string;
}

const settingsStore = useSettingsStore();
const section = "faqs" as const;

const filters = computed(() => settingsStore.getFaqsFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const allFaqs = ref<Faq[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const fetchFaqs = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();

    const searchParams: any = {
      pagination: {
        page: settingsStore.faqs.currentPage,
        pageSize: settingsStore.faqs.pageSize,
      },
      sort: settingsStore.faqs.sortBy,
    };

    if (settingsStore.faqs.searchTerm) {
      searchParams.filters = {
        $or: [
          { title: { $containsi: settingsStore.faqs.searchTerm } },
          { text: { $containsi: settingsStore.faqs.searchTerm } },
        ],
      };
    }

    const response = await strapi.find("faqs", searchParams);
    allFaqs.value = Array.isArray(response.data) ? response.data : [];
    paginationMeta.value = response.meta?.pagination || null;
  } catch (error) {
    console.error("Error fetching faqs:", error);
    allFaqs.value = [];
  } finally {
    loading.value = false;
  }
};

const paginatedFaqs = computed(() => allFaqs.value);

const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

const tableColumns = [
  { label: "ID" },
  { label: "Pregunta" },
  { label: "Respuesta" },
  { label: "Destacado" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "title:asc", label: "Título A-Z" },
  { value: "title:desc", label: "Título Z-A" },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const stripHtml = (html: string) => {
  if (!html) return "";
  // Remove HTML tags - safe for SSR
  if (typeof document === "undefined") {
    // Server-side: basic HTML tag removal
    return html.replace(/<[^>]*>/g, "").trim();
  }
  // Client-side: use DOM parser
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return "-";
  const cleanText = stripHtml(text);
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.slice(0, Math.max(0, maxLength)) + "...";
};

const router = useRouter();

const handleViewFaq = (faqId: number) => {
  router.push(`/faqs/${faqId}`);
};

const handleEditFaq = (faqId: number) => {
  router.push(`/faqs/${faqId}/editar`);
};

watch(
  [
    () => settingsStore.faqs.searchTerm,
    () => settingsStore.faqs.sortBy,
    () => settingsStore.faqs.pageSize,
    () => settingsStore.faqs.currentPage,
  ],
  () => {
    fetchFaqs();
  },
  { immediate: true },
);

onMounted(() => {
  fetchFaqs();
});
</script>
