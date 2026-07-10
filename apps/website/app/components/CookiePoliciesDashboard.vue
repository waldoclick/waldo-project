<template>
  <section class="cookies cookies--dashboard">
    <div class="cookies--dashboard__container">
      <div class="cookies--dashboard__header">
        <SearchDashboard
          :model-value="settingsStore.cookiePolicies.searchTerm"
          placeholder="Buscar Política de Cookies..."
          class="cookies--dashboard__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          class="cookies--dashboard__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <p v-if="!isDraggable" class="cookies--dashboard__drag-note">
        El arrastre para reordenar no esta disponible mientras se filtra.
      </p>

      <div class="cookies--dashboard__table-wrapper">
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
              v-model="allCookiePolicies"
              tag="tbody"
              item-key="id"
              handle=".cookies--dashboard__drag"
              :disabled="!isDraggable"
              class="table--default__body"
              @end="handleReorder"
            >
              <template #item="{ element: cookiePolicy }">
                <TableRow :key="cookiePolicy.id">
                  <TableCell>
                    <button
                      class="cookies--dashboard__drag"
                      :class="{
                        'cookies--dashboard__drag--disabled': !isDraggable,
                      }"
                      :disabled="!isDraggable"
                      title="Arrastrar para reordenar"
                    >
                      <GripVertical class="cookies--dashboard__drag__icon" />
                    </button>
                  </TableCell>
                  <TableCell>{{ cookiePolicy.order ?? "-" }}</TableCell>
                  <TableCell>
                    <div
                      v-if="cookiePolicy.title"
                      v-tooltip="
                        stripHtml(cookiePolicy.title).length > 60
                          ? stripHtml(cookiePolicy.title)
                          : ''
                      "
                      class="cookies--dashboard__question"
                    >
                      {{ truncateText(cookiePolicy.title, 60) }}
                    </div>
                    <div v-else class="cookies--dashboard__question">-</div>
                  </TableCell>
                  <TableCell>
                    <div
                      v-if="cookiePolicy.text"
                      v-tooltip="
                        stripHtml(cookiePolicy.text).length > 80
                          ? stripHtml(cookiePolicy.text)
                          : ''
                      "
                      class="cookies--dashboard__answer"
                    >
                      {{ truncateText(cookiePolicy.text, 80) }}
                    </div>
                    <div v-else class="cookies--dashboard__answer">-</div>
                  </TableCell>
                  <TableCell>{{
                    formatDate(cookiePolicy.updatedAt)
                  }}</TableCell>
                  <TableCell align="right">
                    <div class="cookies--dashboard__actions">
                      <button
                        class="cookies--dashboard__action"
                        title="Ver Política de Cookies"
                        @click="handleViewCookiePolicy(cookiePolicy.documentId)"
                      >
                        <Eye class="cookies--dashboard__action__icon" />
                      </button>
                      <button
                        class="cookies--dashboard__action"
                        title="Editar Política de Cookies"
                        @click="handleEditCookiePolicy(cookiePolicy.documentId)"
                      >
                        <Pencil class="cookies--dashboard__action__icon" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
            </draggable>
          </table>
        </div>

        <div
          v-if="allCookiePolicies.length === 0 && !loading"
          class="cookies--dashboard__empty"
        >
          <p>No se encontraron políticas de cookies</p>
        </div>

        <div v-if="loading" class="cookies--dashboard__loading">
          <p>Cargando políticas de cookies...</p>
        </div>
      </div>

      <div class="cookies--dashboard__footer">
        <p v-if="!loading" class="cookies--dashboard__count">
          {{ allCookiePolicies.length }} registro{{
            allCookiePolicies.length !== 1 ? "s" : ""
          }}
        </p>
        <p v-if="saving" class="cookies--dashboard__saving">
          Guardando orden...
        </p>
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
import { formatDate } from "@/utils/date";

interface CookiePolicy {
  id: number;
  documentId: string;
  title: string;
  text: string;
  order: number | null;
  updatedAt: string;
  createdAt: string;
}

const settingsStore = useSettingsStore();
const section = "cookiePolicies" as const;

const filters = computed(() => settingsStore.getCookiePoliciesFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const apiClient = useApiClient();
const allCookiePolicies = ref<CookiePolicy[]>([]);
const loading = ref(false);
const saving = ref(false);

const isDraggable = computed(() => !settingsStore.cookiePolicies.searchTerm);

const fetchCookiePolicies = async () => {
  try {
    loading.value = true;

    const searchParams: Record<string, unknown> = {
      pagination: { pageSize: 200 },
      sort: settingsStore.cookiePolicies.sortBy,
    };

    if (settingsStore.cookiePolicies.searchTerm) {
      searchParams.filters = {
        $or: [
          { title: { $containsi: settingsStore.cookiePolicies.searchTerm } },
          { text: { $containsi: settingsStore.cookiePolicies.searchTerm } },
        ],
      };
    }

    const response = (await apiClient("cookie-policies", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    })) as { data: CookiePolicy[] };
    allCookiePolicies.value = Array.isArray(response.data)
      ? (response.data as CookiePolicy[])
      : [];
  } catch (error) {
    console.error("Error fetching cookie policies:", error);
    allCookiePolicies.value = [];
  } finally {
    loading.value = false;
  }
};

const handleReorder = async () => {
  if (!isDraggable.value) return;
  saving.value = true;
  try {
    const updates = allCookiePolicies.value.map((cookiePolicy, index) => ({
      documentId: cookiePolicy.documentId,
      order: index + 1,
    }));

    await apiClient("/cookie-policies/reorder", {
      method: "POST",
      body: { data: updates },
    });

    allCookiePolicies.value = allCookiePolicies.value.map(
      (cookiePolicy, index) => ({
        ...cookiePolicy,
        order: index + 1,
      }),
    );
  } catch (error) {
    console.error("Error saving cookie policy order:", error);
    await fetchCookiePolicies();
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
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "").trim();
  }
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

const handleViewCookiePolicy = (documentId: string) => {
  router.push(`/dashboard/maintenance/cookies/${documentId}`);
};

const handleEditCookiePolicy = (documentId: string) => {
  router.push(`/dashboard/maintenance/cookies/${documentId}/edit`);
};

watch(
  [
    () => settingsStore.cookiePolicies.searchTerm,
    () => settingsStore.cookiePolicies.sortBy,
  ],
  () => {
    fetchCookiePolicies();
  },
  { immediate: true },
);
</script>
