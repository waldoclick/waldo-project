<template>
  <section class="policies policies--default">
    <div class="policies--default__container">
      <div class="policies--default__header">
        <SearchDefault
          :model-value="settingsStore.policies.searchTerm"
          placeholder="Buscar Politicas..."
          class="policies--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          class="policies--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <p v-if="!isDraggable" class="policies--default__drag-note">
        El arrastre para reordenar no esta disponible mientras se filtra.
      </p>

      <div class="policies--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <draggable
            v-model="allPolicies"
            tag="template"
            item-key="id"
            handle=".policies--default__drag"
            :disabled="!isDraggable"
            @end="handleReorder"
          >
            <template #item="{ element: policy }">
              <TableRow :key="policy.id">
                <TableCell>
                  <button
                    class="policies--default__drag"
                    :class="{
                      'policies--default__drag--disabled': !isDraggable,
                    }"
                    :disabled="!isDraggable"
                    title="Arrastrar para reordenar"
                  >
                    <GripVertical class="policies--default__drag__icon" />
                  </button>
                </TableCell>
                <TableCell>{{ policy.id }}</TableCell>
                <TableCell>
                  <div
                    v-if="policy.title"
                    v-tooltip="
                      stripHtml(policy.title).length > 60
                        ? stripHtml(policy.title)
                        : ''
                    "
                    class="policies--default__question"
                  >
                    {{ truncateText(policy.title, 60) }}
                  </div>
                  <div v-else class="policies--default__question">-</div>
                </TableCell>
                <TableCell>
                  <div
                    v-if="policy.text"
                    v-tooltip="
                      stripHtml(policy.text).length > 80
                        ? stripHtml(policy.text)
                        : ''
                    "
                    class="policies--default__answer"
                  >
                    {{ truncateText(policy.text, 80) }}
                  </div>
                  <div v-else class="policies--default__answer">-</div>
                </TableCell>
                <TableCell>{{ policy.order ?? "-" }}</TableCell>
                <TableCell>{{ formatDate(policy.updatedAt) }}</TableCell>
                <TableCell align="right">
                  <div class="policies--default__actions">
                    <button
                      class="policies--default__action"
                      title="Ver Politica"
                      @click="handleViewPolicy(policy.id)"
                    >
                      <Eye class="policies--default__action__icon" />
                    </button>
                    <button
                      class="policies--default__action"
                      title="Editar Politica"
                      @click="handleEditPolicy(policy.id)"
                    >
                      <Pencil class="policies--default__action__icon" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            </template>
          </draggable>
        </TableDefault>

        <div
          v-if="allPolicies.length === 0 && !loading"
          class="policies--default__empty"
        >
          <p>No se encontraron politicas</p>
        </div>

        <div v-if="loading" class="policies--default__loading">
          <p>Cargando politicas...</p>
        </div>
      </div>

      <p v-if="saving" class="policies--default__saving">Guardando orden...</p>
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
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";

interface Policy {
  id: number;
  documentId: string;
  title: string;
  text: string;
  order: number | null;
  updatedAt: string;
  createdAt: string;
}

const settingsStore = useSettingsStore();
const section = "policies" as const;

const filters = computed(() => settingsStore.getPoliciesFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const apiClient = useApiClient();
const allPolicies = ref<Policy[]>([]);
const loading = ref(false);
const saving = ref(false);

const isDraggable = computed(() => !settingsStore.policies.searchTerm);

const fetchPolicies = async () => {
  try {
    loading.value = true;

    const searchParams: Record<string, unknown> = {
      pagination: { pageSize: 200 },
      sort: settingsStore.policies.sortBy,
    };

    if (settingsStore.policies.searchTerm) {
      searchParams.filters = {
        $or: [
          { title: { $containsi: settingsStore.policies.searchTerm } },
          { text: { $containsi: settingsStore.policies.searchTerm } },
        ],
      };
    }

    const response = (await apiClient("policies", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    })) as {
      data: Policy[];
    };
    allPolicies.value = Array.isArray(response.data)
      ? (response.data as Policy[])
      : [];
  } catch (error) {
    console.error("Error fetching policies:", error);
    allPolicies.value = [];
  } finally {
    loading.value = false;
  }
};

const handleReorder = async () => {
  if (!isDraggable.value) return;
  saving.value = true;
  try {
    const updates = allPolicies.value.map((policy, index) => ({
      documentId: policy.documentId,
      order: index + 1,
    }));

    await Promise.all(
      updates.map((u) =>
        apiClient(`/policies/${u.documentId}`, {
          method: "PUT",
          body: { data: { order: u.order } },
        }),
      ),
    );

    // Update local state to reflect new order values
    allPolicies.value = allPolicies.value.map((policy, index) => ({
      ...policy,
      order: index + 1,
    }));
  } catch (error) {
    console.error("Error saving policy order:", error);
    // Re-fetch to restore server state on failure
    await fetchPolicies();
  } finally {
    saving.value = false;
  }
};

const tableColumns = [
  { label: "" },
  { label: "ID" },
  { label: "Título" },
  { label: "Contenido" },
  { label: "Orden" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

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

const handleViewPolicy = (policyId: number) => {
  router.push(`/policies/${policyId}`);
};

const handleEditPolicy = (policyId: number) => {
  router.push(`/policies/${policyId}/edit`);
};

watch(
  [
    () => settingsStore.policies.searchTerm,
    () => settingsStore.policies.sortBy,
  ],
  () => {
    fetchPolicies();
  },
  { immediate: true },
);
</script>
