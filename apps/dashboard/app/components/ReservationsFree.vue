<template>
  <section class="reservations reservations--free">
    <div class="reservations--free__container">
      <div class="reservations--free__header">
        <SearchDefault
          :model-value="settingsStore.reservations.searchTerm"
          placeholder="Buscar reservas..."
          class="reservations--free__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="reservations--free__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="reservations--free__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow
            v-for="reservation in paginatedReservations"
            :key="reservation.id"
          >
            <TableCell>{{ reservation.id }}</TableCell>
            <TableCell>
              <div class="reservations--free__user">
                {{ reservation.user?.username || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(reservation.createdAt) }}</TableCell>
            <TableCell align="right">
              <button
                class="reservations--free__action"
                title="Ver reserva"
                @click="handleViewReservation(reservation.id)"
              >
                <Eye class="reservations--free__action__icon" />
              </button>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedReservations.length === 0 && !loading"
          class="reservations--free__empty"
        >
          <p>No se encontraron reservas libres</p>
        </div>

        <div v-if="loading" class="reservations--free__loading">
          <p>Cargando reservas...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.reservations.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.reservations.pageSize"
        class="reservations--free__pagination"
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

interface Reservation {
  id: number;
  createdAt: string;
  user?: { username: string };
  ad?: { name: string } | null;
}

// Store de settings
const settingsStore = useSettingsStore();
const section = "reservations" as const;

// Computed para los filtros de reservas
const filters = computed(() => settingsStore.getReservationsFilters);

// Handler para cambios en filtros
const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

// Estado
const allReservations = ref<Reservation[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

// Fetch de reservas libres desde Strapi
const fetchFreeReservations = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();

    const searchParams: any = {
      pagination: {
        page: settingsStore.reservations.currentPage,
        pageSize: settingsStore.reservations.pageSize,
      },
      sort: settingsStore.reservations.sortBy,
      populate: {
        user: {
          fields: ["username"],
        },
      },
      filters: {
        ad: {
          $null: true,
        },
      },
    };

    // Agregar búsqueda si existe
    if (settingsStore.reservations.searchTerm) {
      searchParams.filters.$or = [
        {
          "user.username": {
            $containsi: settingsStore.reservations.searchTerm,
          },
        },
        { "user.email": { $containsi: settingsStore.reservations.searchTerm } },
      ];
    }

    const response = await strapi.find("ad-reservations", searchParams);
    allReservations.value = Array.isArray(response.data) ? response.data : [];

    // Guardar información de paginación de Strapi
    paginationMeta.value = response.meta?.pagination
      ? response.meta.pagination
      : null;
  } catch (error) {
    console.error("Error fetching free reservations:", error);
    allReservations.value = [];
  } finally {
    loading.value = false;
  }
};

// Usar los datos directamente de Strapi (ya vienen paginados y ordenados)
const paginatedReservations = computed(() => allReservations.value);

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
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "user.username:asc", label: "Usuario A-Z" },
  { value: "user.username:desc", label: "Usuario Z-A" },
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

const router = useRouter();

const handleViewReservation = (reservationId: number) => {
  // Navegar a la página de detalle de la reserva
  router.push(`/reservas/${reservationId}`);
};

// Watch para recargar cuando cambian los filtros o la búsqueda
watch(
  [
    () => settingsStore.reservations.searchTerm,
    () => settingsStore.reservations.sortBy,
    () => settingsStore.reservations.pageSize,
    () => settingsStore.reservations.currentPage,
  ],
  () => {
    fetchFreeReservations();
  },
  { immediate: true },
);

// Cargar datos al montar
onMounted(() => {
  fetchFreeReservations();
});
</script>
