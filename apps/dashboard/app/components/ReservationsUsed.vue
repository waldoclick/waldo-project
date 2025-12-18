<template>
  <section class="reservations reservations--used">
    <div class="reservations--used__container">
      <div class="reservations--used__header">
        <SearchDefault
          :model-value="settingsStore.reservations.searchTerm"
          placeholder="Buscar reservas..."
          class="reservations--used__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="reservations--used__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="reservations--used__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow
            v-for="reservation in paginatedReservations"
            :key="reservation.id"
          >
            <TableCell>{{ reservation.id }}</TableCell>
            <TableCell>
              <div class="reservations--used__user">
                {{ reservation.user?.username || "-" }}
              </div>
            </TableCell>
            <TableCell>
              <div class="reservations--used__ad">
                {{ reservation.ad?.name || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(reservation.createdAt) }}</TableCell>
            <TableCell align="right">
              <button
                class="reservations--used__action"
                title="Ver reserva"
                @click="handleViewReservation(reservation.id)"
              >
                <Eye class="reservations--used__action__icon" />
              </button>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="filteredReservations.length === 0 && !loading"
          class="reservations--used__empty"
        >
          <p>No se encontraron reservas usadas</p>
        </div>

        <div v-if="loading" class="reservations--used__loading">
          <p>Cargando reservas...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.reservations.currentPage"
        :total-pages="totalPages"
        class="reservations--used__pagination"
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

// Fetch de reservas usadas desde Strapi
const fetchUsedReservations = async () => {
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
        ad: {
          fields: ["name"],
        },
      },
      filters: {
        ad: {
          $notNull: true,
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
        { "ad.name": { $containsi: settingsStore.reservations.searchTerm } },
      ];
    }

    const response = await strapi.find("ad-reservations", searchParams);
    allReservations.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching used reservations:", error);
    allReservations.value = [];
  } finally {
    loading.value = false;
  }
};

// Filtrar reservas por búsqueda (cliente)
const filteredReservations = computed(() => {
  if (!settingsStore.reservations.searchTerm) {
    return allReservations.value;
  }

  const search = settingsStore.reservations.searchTerm.toLowerCase();
  return allReservations.value.filter((reservation) => {
    const username = reservation.user?.username?.toLowerCase() || "";
    const adName = reservation.ad?.name?.toLowerCase() || "";

    return username.includes(search) || adName.includes(search);
  });
});

// Ordenar reservas
const sortedReservations = computed(() => {
  const reservations = [...filteredReservations.value];
  const [field, direction] = settingsStore.reservations.sortBy.split(":");

  return reservations.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (field === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    } else if (field === "user.username") {
      aValue = a.user?.username || "";
      bValue = b.user?.username || "";
    } else if (field === "ad.name") {
      aValue = a.ad?.name || "";
      bValue = b.ad?.name || "";
    } else {
      aValue = a[field as keyof Reservation];
      bValue = b[field as keyof Reservation];
    }

    if (direction === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
});

// Paginar reservas
const totalPages = computed(() => {
  return Math.ceil(
    sortedReservations.value.length / settingsStore.reservations.pageSize,
  );
});

const paginatedReservations = computed(() => {
  const start =
    (settingsStore.reservations.currentPage - 1) *
    settingsStore.reservations.pageSize;
  const end = start + settingsStore.reservations.pageSize;
  return sortedReservations.value.slice(start, end);
});

// Columnas de la tabla
const tableColumns = [
  { label: "ID" },
  { label: "Usuario" },
  { label: "Anuncio" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "user.username:asc", label: "Usuario A-Z" },
  { value: "user.username:desc", label: "Usuario Z-A" },
  { value: "ad.name:asc", label: "Anuncio A-Z" },
  { value: "ad.name:desc", label: "Anuncio Z-A" },
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
    fetchUsedReservations();
  },
  { immediate: true },
);

// Cargar datos al montar
onMounted(() => {
  fetchUsedReservations();
});
</script>
