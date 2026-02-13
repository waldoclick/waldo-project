<template>
  <section class="users users--default">
    <div class="users--default__container">
      <div class="users--default__header">
        <SearchDefault
          :model-value="settingsStore.users.searchTerm"
          placeholder="Buscar usuarios..."
          class="users--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="users--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="users--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="user in paginatedUsers" :key="user.id">
            <TableCell>{{ user.id }}</TableCell>
            <TableCell>
              <div class="users--default__username">
                {{ user.username || "-" }}
              </div>
            </TableCell>
            <TableCell>
              <div class="users--default__email">
                {{ user.email || "-" }}
              </div>
            </TableCell>
            <TableCell>
              <div class="users--default__name">
                {{ formatName(user.firstname, user.lastname) }}
              </div>
            </TableCell>
            <TableCell>
              <div class="users--default__role">
                {{ user.role?.name || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(user.createdAt) }}</TableCell>
            <TableCell align="right">
              <button
                class="users--default__action"
                title="Ver usuario"
                @click="handleViewUser(user.id)"
              >
                <Eye class="users--default__action__icon" />
              </button>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedUsers.length === 0 && !loading"
          class="users--default__empty"
        >
          <p>No se encontraron usuarios</p>
        </div>

        <div v-if="loading" class="users--default__loading">
          <p>Cargando usuarios...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.users.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.users.pageSize"
        class="users--default__pagination"
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
import { Eye } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

interface User {
  id: number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  createdAt: string;
  role?: { name: string };
}

// Store de settings
const settingsStore = useSettingsStore();
const section = "users" as const;

// Computed para los filtros de usuarios
const filters = computed(() => settingsStore.getUsersFilters);

// Handler para cambios en filtros
const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

// Estado
const allUsers = ref<User[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

// Fetch de usuarios desde Strapi
const fetchUsers = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();

    const searchParams: any = {
      pagination: {
        page: settingsStore.users.currentPage,
        pageSize: settingsStore.users.pageSize,
      },
      sort: settingsStore.users.sortBy,
      populate: {
        role: {
          fields: ["name"],
        },
      },
    };

    // Agregar búsqueda si existe
    if (settingsStore.users.searchTerm) {
      searchParams.filters = {
        $or: [
          { username: { $containsi: settingsStore.users.searchTerm } },
          { email: { $containsi: settingsStore.users.searchTerm } },
          { firstname: { $containsi: settingsStore.users.searchTerm } },
          { lastname: { $containsi: settingsStore.users.searchTerm } },
        ],
      };
    }

    const response = await strapi.find("users", searchParams);

    // Manejar diferentes estructuras de respuesta de Strapi
    if (Array.isArray(response)) {
      // Si la respuesta es directamente un array (Strapi v5 por defecto)
      allUsers.value = response;
      paginationMeta.value = {
        page: settingsStore.users.currentPage,
        pageSize: settingsStore.users.pageSize,
        pageCount: 1,
        total: response.length,
      };
    } else if (response.data) {
      // Si la respuesta tiene estructura { data: [...], meta: {...} } (controlador personalizado)
      allUsers.value = Array.isArray(response.data) ? response.data : [];
      paginationMeta.value = response.meta?.pagination || null;
    } else if (response.results) {
      // Si la respuesta tiene estructura { results: [...], pagination: {...} }
      allUsers.value = Array.isArray(response.results) ? response.results : [];
      paginationMeta.value = response.pagination || null;
    } else {
      // Fallback
      allUsers.value = [];
      paginationMeta.value = null;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    allUsers.value = [];
  } finally {
    loading.value = false;
  }
};

// Usar los datos directamente de Strapi (ya vienen paginados y ordenados)
const paginatedUsers = computed(() => allUsers.value);

// Calcular totalPages desde meta.pagination de Strapi
const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

// Columnas de la tabla
const tableColumns = [
  { label: "ID" },
  { label: "Usuario" },
  { label: "Email" },
  { label: "Nombre" },
  { label: "Rol" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "username:asc", label: "Usuario A-Z" },
  { value: "username:desc", label: "Usuario Z-A" },
  { value: "email:asc", label: "Email A-Z" },
  { value: "email:desc", label: "Email Z-A" },
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

const formatName = (firstname?: string, lastname?: string) => {
  if (!firstname && !lastname) return "-";
  return [firstname, lastname].filter(Boolean).join(" ") || "-";
};

const router = useRouter();

const handleViewUser = (userId: number) => {
  // Navegar a la página de detalle del usuario
  router.push(`/usuarios/${userId}`);
};

// Watch para recargar cuando cambian los filtros o la búsqueda
watch(
  [
    () => settingsStore.users.searchTerm,
    () => settingsStore.users.sortBy,
    () => settingsStore.users.pageSize,
    () => settingsStore.users.currentPage,
  ],
  () => {
    fetchUsers();
  },
  { immediate: true },
);

// Cargar datos al montar
onMounted(() => {
  fetchUsers();
});
</script>
