<template>
  <section class="users users--reservations">
    <div class="users--reservations__table-wrapper">
      <TableDefault :columns="tableColumns">
        <TableRow
          v-for="reservation in paginatedReservations"
          :key="reservation.id"
        >
          <TableCell>{{ reservation.id }}</TableCell>
          <TableCell>{{ formatDate(reservation.createdAt) }}</TableCell>
          <TableCell align="right">
            <button
              class="users--reservations__action"
              title="Ver reserva"
              @click="handleViewReservation(reservation.id)"
            >
              <Eye class="users--reservations__action__icon" />
            </button>
          </TableCell>
        </TableRow>
      </TableDefault>

      <div
        v-if="paginatedReservations.length === 0 && !loading"
        class="users--reservations__empty"
      >
        <p>No se encontraron reservas libres</p>
      </div>

      <div v-if="loading" class="users--reservations__loading">
        <p>Cargando reservas...</p>
      </div>
    </div>

    <PaginationDefault
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-records="totalRecords"
      :page-size="pageSize"
      class="users--reservations__pagination"
      @page-change="handlePageChange"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye } from "lucide-vue-next";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

interface Reservation {
  id: number;
  createdAt: string;
}

const props = defineProps<{
  userId: string | number;
  userName?: string;
}>();

const pageSize = 10;
const currentPage = ref(1);
const allReservations = ref<Reservation[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const tableColumns = [
  { label: "ID" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const paginatedReservations = computed(() => allReservations.value);

const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

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
  router.push(`/reservas/${reservationId}`);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const resolveUserId = () => {
  if (typeof props.userId === "number") return props.userId;
  const parsed = Number(props.userId);
  return Number.isNaN(parsed) ? props.userId : parsed;
};

const buildUserFilters = (userId: string | number, userName?: string) => {
  const orFilters: Array<Record<string, unknown>> = [
    {
      user: {
        id: {
          $eq: userId,
        },
      },
    },
    {
      user: {
        documentId: {
          $eq: userId,
        },
      },
    },
  ];

  if (userName) {
    orFilters.push({
      user: {
        username: {
          $eq: userName,
        },
      },
    });
  }

  return orFilters;
};

const fetchUserReservations = async () => {
  const userId = resolveUserId();
  if (!userId) {
    allReservations.value = [];
    paginationMeta.value = null;
    return;
  }

  try {
    loading.value = true;
    const strapi = useStrapi();
    const response = await strapi.find("ad-reservations", {
      filters: {
        $and: [
          { $or: buildUserFilters(userId, props.userName) },
          {
            ad: {
              $null: true,
            },
          },
        ],
      },
      pagination: {
        page: currentPage.value,
        pageSize,
      },
      sort: "createdAt:desc",
    });

    allReservations.value = Array.isArray(response.data) ? response.data : [];
    paginationMeta.value = response.meta?.pagination || null;
  } catch (error) {
    console.error("Error fetching free reservations for user:", error);
    allReservations.value = [];
    paginationMeta.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.userId, props.userName, currentPage.value],
  () => {
    fetchUserReservations();
  },
  { immediate: true },
);
</script>
