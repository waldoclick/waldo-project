<template>
  <section class="terms terms--default">
    <div class="terms--default__container">
      <div class="terms--default__header">
        <SearchDefault
          :model-value="settingsStore.terms.searchTerm"
          placeholder="Buscar Condiciones..."
          class="terms--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          class="terms--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <p v-if="!isDraggable" class="terms--default__drag-note">
        El arrastre para reordenar no esta disponible mientras se filtra.
      </p>

      <div class="terms--default__table-wrapper">
        <div class="table table--default">
          <table class="table--default__table">
            <thead class="table--default__header">
              <tr class="table--default__row">
                <th class="table--default__head"></th>
                <th class="table--default__head">Orden</th>
                <th class="table--default__head">Título</th>
                <th class="table--default__head">Contenido</th>
                <th class="table--default__head">Fecha</th>
                <th class="table--default__head table--default__head--right">
                  Acciones
                </th>
              </tr>
            </thead>
            <draggable
              v-model="allTerms"
              tag="tbody"
              item-key="id"
              handle=".terms--default__drag"
              :disabled="!isDraggable"
              class="table--default__body"
              @end="handleReorder"
            >
              <template #item="{ element: term }">
                <TableRow :key="term.id">
                  <TableCell>
                    <button
                      class="terms--default__drag"
                      :class="{
                        'terms--default__drag--disabled': !isDraggable,
                      }"
                      :disabled="!isDraggable"
                      title="Arrastrar para reordenar"
                    >
                      <GripVertical class="terms--default__drag__icon" />
                    </button>
                  </TableCell>
                  <TableCell>{{ term.order ?? "-" }}</TableCell>
                  <TableCell>
                    <div
                      v-if="term.title"
                      v-tooltip="
                        stripHtml(term.title).length > 60
                          ? stripHtml(term.title)
                          : ''
                      "
                      class="terms--default__question"
                    >
                      {{ truncateText(term.title, 60) }}
                    </div>
                    <div v-else class="terms--default__question">-</div>
                  </TableCell>
                  <TableCell>
                    <div
                      v-if="term.text"
                      v-tooltip="
                        stripHtml(term.text).length > 80
                          ? stripHtml(term.text)
                          : ''
                      "
                      class="terms--default__answer"
                    >
                      {{ truncateText(term.text, 80) }}
                    </div>
                    <div v-else class="terms--default__answer">-</div>
                  </TableCell>
                  <TableCell>{{ formatDate(term.updatedAt) }}</TableCell>
                  <TableCell align="right">
                    <div class="terms--default__actions">
                      <button
                        class="terms--default__action"
                        title="Ver Condicion"
                        @click="handleViewTerm(term.id)"
                      >
                        <Eye class="terms--default__action__icon" />
                      </button>
                      <button
                        class="terms--default__action"
                        title="Editar Condicion"
                        @click="handleEditTerm(term.id)"
                      >
                        <Pencil class="terms--default__action__icon" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
            </draggable>
          </table>
        </div>

        <div
          v-if="allTerms.length === 0 && !loading"
          class="terms--default__empty"
        >
          <p>No se encontraron condiciones</p>
        </div>

        <div v-if="loading" class="terms--default__loading">
          <p>Cargando condiciones...</p>
        </div>
      </div>

      <div class="terms--default__footer">
        <p v-if="!loading" class="terms--default__count">
          {{ allTerms.length }} registro{{ allTerms.length !== 1 ? "s" : "" }}
        </p>
        <p v-if="saving" class="terms--default__saving">Guardando orden...</p>
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

interface Term {
  id: number;
  documentId: string;
  title: string;
  text: string;
  order: number | null;
  updatedAt: string;
  createdAt: string;
}

const settingsStore = useSettingsStore();
const section = "terms" as const;

const filters = computed(() => settingsStore.getTermsFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const apiClient = useApiClient();
const allTerms = ref<Term[]>([]);
const loading = ref(false);
const saving = ref(false);

const isDraggable = computed(() => !settingsStore.terms.searchTerm);

const fetchTerms = async () => {
  try {
    loading.value = true;

    const searchParams: Record<string, unknown> = {
      pagination: { pageSize: 200 },
      sort: settingsStore.terms.sortBy,
    };

    if (settingsStore.terms.searchTerm) {
      searchParams.filters = {
        $or: [
          { title: { $containsi: settingsStore.terms.searchTerm } },
          { text: { $containsi: settingsStore.terms.searchTerm } },
        ],
      };
    }

    const response = (await apiClient("terms", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    })) as {
      data: Term[];
    };
    allTerms.value = Array.isArray(response.data)
      ? (response.data as Term[])
      : [];
  } catch (error) {
    console.error("Error fetching terms:", error);
    allTerms.value = [];
  } finally {
    loading.value = false;
  }
};

const handleReorder = async () => {
  if (!isDraggable.value) return;
  saving.value = true;
  try {
    const updates = allTerms.value.map((term, index) => ({
      documentId: term.documentId,
      order: index + 1,
    }));

    await Promise.all(
      updates.map((u) =>
        apiClient(`/terms/${u.documentId}`, {
          method: "PUT",
          body: { data: { order: u.order } },
        }),
      ),
    );

    // Update local state to reflect new order values
    allTerms.value = allTerms.value.map((term, index) => ({
      ...term,
      order: index + 1,
    }));
  } catch (error) {
    console.error("Error saving term order:", error);
    // Re-fetch to restore server state on failure
    await fetchTerms();
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

const handleViewTerm = (termId: number) => {
  router.push(`/terms/${termId}`);
};

const handleEditTerm = (termId: number) => {
  router.push(`/terms/${termId}/edit`);
};

watch(
  [() => settingsStore.terms.searchTerm, () => settingsStore.terms.sortBy],
  () => {
    fetchTerms();
  },
  { immediate: true },
);
</script>
