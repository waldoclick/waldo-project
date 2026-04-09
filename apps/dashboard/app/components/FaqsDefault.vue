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
          class="faqs--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <p v-if="!isDraggable" class="faqs--default__drag-note">
        El arrastre para reordenar no esta disponible mientras se filtra.
      </p>

      <div class="faqs--default__table-wrapper">
        <div class="table table--default">
          <table class="table--default__table">
            <thead class="table--default__header">
              <tr class="table--default__row">
                <th class="table--default__head"></th>
                <th class="table--default__head">Orden</th>
                <th class="table--default__head">Pregunta</th>
                <th class="table--default__head">Respuesta</th>
                <th class="table--default__head">Destacado</th>
                <th class="table--default__head">Fecha</th>
                <th class="table--default__head table--default__head--right">
                  Acciones
                </th>
              </tr>
            </thead>
            <draggable
              v-model="allFaqs"
              tag="tbody"
              item-key="id"
              handle=".faqs--default__drag"
              :disabled="!isDraggable"
              class="table--default__body"
              @end="handleReorder"
            >
              <template #item="{ element: faq }">
                <TableRow :key="faq.id">
                  <TableCell>
                    <button
                      class="faqs--default__drag"
                      :class="{
                        'faqs--default__drag--disabled': !isDraggable,
                      }"
                      :disabled="!isDraggable"
                      title="Arrastrar para reordenar"
                    >
                      <GripVertical class="faqs--default__drag__icon" />
                    </button>
                  </TableCell>
                  <TableCell>{{ faq.order ?? "-" }}</TableCell>
                  <TableCell>
                    <div
                      v-if="faq.title"
                      v-tooltip="
                        stripHtml(faq.title).length > 60
                          ? stripHtml(faq.title)
                          : ''
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
                        stripHtml(faq.text).length > 80
                          ? stripHtml(faq.text)
                          : ''
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
              </template>
            </draggable>
          </table>
        </div>

        <div
          v-if="allFaqs.length === 0 && !loading"
          class="faqs--default__empty"
        >
          <p>No se encontraron FAQs</p>
        </div>

        <div v-if="loading" class="faqs--default__loading">
          <p>Cargando FAQs...</p>
        </div>
      </div>

      <div class="faqs--default__footer">
        <p v-if="!loading" class="faqs--default__count">
          {{ allFaqs.length }} registro{{ allFaqs.length !== 1 ? "s" : "" }}
        </p>
        <p v-if="saving" class="faqs--default__saving">Guardando orden...</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye, Pencil, GripVertical } from "lucide-vue-next";
import draggable from "vuedraggable";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";

interface Faq {
  id: number;
  documentId: string;
  title: string;
  text: string;
  featured: boolean;
  order: number | null;
  updatedAt: string;
  createdAt: string;
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

const apiClient = useApiClient();
const allFaqs = ref<Faq[]>([]);
const loading = ref(false);
const saving = ref(false);

const isDraggable = computed(() => !settingsStore.faqs.searchTerm);

const fetchFaqs = async () => {
  try {
    loading.value = true;

    const searchParams: Record<string, unknown> = {
      pagination: { pageSize: 200 },
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

    const response = (await apiClient("faqs", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    })) as {
      data: Faq[];
    };
    allFaqs.value = Array.isArray(response.data)
      ? (response.data as Faq[])
      : [];
  } catch (error) {
    console.error("Error fetching faqs:", error);
    allFaqs.value = [];
  } finally {
    loading.value = false;
  }
};

const handleReorder = async () => {
  if (!isDraggable.value) return;
  saving.value = true;
  try {
    const updates = allFaqs.value.map((faq, index) => ({
      documentId: faq.documentId,
      order: index + 1,
    }));

    await apiClient("/faqs/reorder", {
      method: "POST",
      body: { data: updates },
    });

    // Update local state to reflect new order values
    allFaqs.value = allFaqs.value.map((faq, index) => ({
      ...faq,
      order: index + 1,
    }));
  } catch (error) {
    console.error("Error saving faq order:", error);
    // Re-fetch to restore server state on failure
    await fetchFaqs();
  } finally {
    saving.value = false;
  }
};

const sortOptions = [
  { value: "order:asc", label: "Orden asc." },
  { value: "order:desc", label: "Orden desc." },
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "title:asc", label: "Título A-Z" },
  { value: "title:desc", label: "Título Z-A" },
];

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
  router.push(`/faqs/${faqId}/edit`);
};

watch(
  [() => settingsStore.faqs.searchTerm, () => settingsStore.faqs.sortBy],
  () => {
    fetchFaqs();
  },
  { immediate: true },
);
</script>
