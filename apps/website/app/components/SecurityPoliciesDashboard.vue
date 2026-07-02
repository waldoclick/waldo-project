<template>
  <section class="security security--dashboard">
    <div class="security--dashboard__container">
      <div class="security--dashboard__header">
        <SearchDashboard
          :model-value="settingsStore.securityPolicies.searchTerm"
          placeholder="Buscar Política de Seguridad..."
          class="security--dashboard__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          class="security--dashboard__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <p v-if="!isDraggable" class="security--dashboard__drag-note">
        El arrastre para reordenar no esta disponible mientras se filtra.
      </p>

      <div class="security--dashboard__table-wrapper">
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
              v-model="allSecurityPolicies"
              tag="tbody"
              item-key="id"
              handle=".security--dashboard__drag"
              :disabled="!isDraggable"
              class="table--default__body"
              @end="handleReorder"
            >
              <template #item="{ element: securityPolicy }">
                <TableRow :key="securityPolicy.id">
                  <TableCell>
                    <button
                      class="security--dashboard__drag"
                      :class="{
                        'security--dashboard__drag--disabled': !isDraggable,
                      }"
                      :disabled="!isDraggable"
                      title="Arrastrar para reordenar"
                    >
                      <GripVertical class="security--dashboard__drag__icon" />
                    </button>
                  </TableCell>
                  <TableCell>{{ securityPolicy.order ?? "-" }}</TableCell>
                  <TableCell>
                    <div
                      v-if="securityPolicy.title"
                      v-tooltip="
                        stripHtml(securityPolicy.title).length > 60
                          ? stripHtml(securityPolicy.title)
                          : ''
                      "
                      class="security--dashboard__question"
                    >
                      {{ truncateText(securityPolicy.title, 60) }}
                    </div>
                    <div v-else class="security--dashboard__question">-</div>
                  </TableCell>
                  <TableCell>
                    <div
                      v-if="securityPolicy.text"
                      v-tooltip="
                        stripHtml(securityPolicy.text).length > 80
                          ? stripHtml(securityPolicy.text)
                          : ''
                      "
                      class="security--dashboard__answer"
                    >
                      {{ truncateText(securityPolicy.text, 80) }}
                    </div>
                    <div v-else class="security--dashboard__answer">-</div>
                  </TableCell>
                  <TableCell>{{
                    formatDate(securityPolicy.updatedAt)
                  }}</TableCell>
                  <TableCell align="right">
                    <div class="security--dashboard__actions">
                      <button
                        class="security--dashboard__action"
                        title="Ver Política de Seguridad"
                        @click="
                          handleViewSecurityPolicy(securityPolicy.documentId)
                        "
                      >
                        <Eye class="security--dashboard__action__icon" />
                      </button>
                      <button
                        class="security--dashboard__action"
                        title="Editar Política de Seguridad"
                        @click="
                          handleEditSecurityPolicy(securityPolicy.documentId)
                        "
                      >
                        <Pencil class="security--dashboard__action__icon" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
            </draggable>
          </table>
        </div>

        <div
          v-if="allSecurityPolicies.length === 0 && !loading"
          class="security--dashboard__empty"
        >
          <p>No se encontraron políticas de seguridad</p>
        </div>

        <div v-if="loading" class="security--dashboard__loading">
          <p>Cargando políticas de seguridad...</p>
        </div>
      </div>

      <div class="security--dashboard__footer">
        <p v-if="!loading" class="security--dashboard__count">
          {{ allSecurityPolicies.length }} registro{{
            allSecurityPolicies.length !== 1 ? "s" : ""
          }}
        </p>
        <p v-if="saving" class="security--dashboard__saving">
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

interface SecurityPolicy {
  id: number;
  documentId: string;
  title: string;
  text: string;
  order: number | null;
  updatedAt: string;
  createdAt: string;
}

const settingsStore = useSettingsStore();
const section = "securityPolicies" as const;

const filters = computed(() => settingsStore.getSecurityPoliciesFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const apiClient = useApiClient();
const allSecurityPolicies = ref<SecurityPolicy[]>([]);
const loading = ref(false);
const saving = ref(false);

const isDraggable = computed(() => !settingsStore.securityPolicies.searchTerm);

const fetchSecurityPolicies = async () => {
  try {
    loading.value = true;

    const searchParams: Record<string, unknown> = {
      pagination: { pageSize: 200 },
      sort: settingsStore.securityPolicies.sortBy,
    };

    if (settingsStore.securityPolicies.searchTerm) {
      searchParams.filters = {
        $or: [
          { title: { $containsi: settingsStore.securityPolicies.searchTerm } },
          { text: { $containsi: settingsStore.securityPolicies.searchTerm } },
        ],
      };
    }

    const response = (await apiClient("security-policies", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    })) as { data: SecurityPolicy[] };
    allSecurityPolicies.value = Array.isArray(response.data)
      ? (response.data as SecurityPolicy[])
      : [];
  } catch (error) {
    console.error("Error fetching security policies:", error);
    allSecurityPolicies.value = [];
  } finally {
    loading.value = false;
  }
};

const handleReorder = async () => {
  if (!isDraggable.value) return;
  saving.value = true;
  try {
    const updates = allSecurityPolicies.value.map((securityPolicy, index) => ({
      documentId: securityPolicy.documentId,
      order: index + 1,
    }));

    await apiClient("/security-policies/reorder", {
      method: "POST",
      body: { data: updates },
    });

    allSecurityPolicies.value = allSecurityPolicies.value.map(
      (securityPolicy, index) => ({
        ...securityPolicy,
        order: index + 1,
      }),
    );
  } catch (error) {
    console.error("Error saving security policy order:", error);
    await fetchSecurityPolicies();
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

const handleViewSecurityPolicy = (documentId: string) => {
  router.push(`/dashboard/maintenance/security/${documentId}`);
};

const handleEditSecurityPolicy = (documentId: string) => {
  router.push(`/dashboard/maintenance/security/${documentId}/edit`);
};

watch(
  [
    () => settingsStore.securityPolicies.searchTerm,
    () => settingsStore.securityPolicies.sortBy,
  ],
  () => {
    fetchSecurityPolicies();
  },
  { immediate: true },
);
</script>
