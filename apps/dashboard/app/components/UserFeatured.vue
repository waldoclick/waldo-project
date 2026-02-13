<template>
  <section class="users users--featured">
    <div class="users--featured__table-wrapper">
      <TableDefault :columns="tableColumns">
        <TableRow v-for="featured in paginatedFeatured" :key="featured.id">
          <TableCell>{{ featured.id }}</TableCell>
          <TableCell>{{ formatCurrency(featured.price) }}</TableCell>
          <TableCell>{{ formatDate(featured.createdAt) }}</TableCell>
          <TableCell align="right">
            <button
              class="users--featured__action"
              title="Ver destacado"
              @click="handleViewFeatured(featured.id)"
            >
              <Eye class="users--featured__action__icon" />
            </button>
          </TableCell>
        </TableRow>
      </TableDefault>

      <div
        v-if="paginatedFeatured.length === 0 && !loading"
        class="users--featured__empty"
      >
        <p>No se encontraron destacados libres</p>
      </div>

      <div v-if="loading" class="users--featured__loading">
        <p>Cargando destacados...</p>
      </div>
    </div>

    <PaginationDefault
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-records="totalRecords"
      :page-size="pageSize"
      class="users--featured__pagination"
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

interface Featured {
  id: number;
  price: number | string;
  createdAt: string;
}

const props = defineProps<{
  userId: string | number;
}>();

const pageSize = 10;
const currentPage = ref(1);
const allFeatured = ref<Featured[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const tableColumns = [
  { label: "ID" },
  { label: "Precio" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const paginatedFeatured = computed(() => allFeatured.value);

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

const formatCurrency = (amount: number | string) => {
  const numAmount =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

const router = useRouter();

const handleViewFeatured = (featuredId: number) => {
  router.push(`/destacados/${featuredId}`);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const resolveUserId = () => {
  if (typeof props.userId === "number") return props.userId;
  const parsed = Number(props.userId);
  return Number.isNaN(parsed) ? props.userId : parsed;
};

const fetchUserFeatured = async () => {
  const userId = resolveUserId();
  if (!userId) {
    allFeatured.value = [];
    paginationMeta.value = null;
    return;
  }

  try {
    loading.value = true;
    const strapi = useStrapi();
    const response = await strapi.find("ad-featured-reservations", {
      filters: {
        user: {
          id: {
            $eq: userId,
          },
        },
        ad: {
          $null: true,
        },
        price: {
          $eq: "0",
        },
      },
      pagination: {
        page: currentPage.value,
        pageSize,
      },
      sort: "createdAt:desc",
    });

    allFeatured.value = Array.isArray(response.data) ? response.data : [];
    paginationMeta.value = response.meta?.pagination || null;
  } catch (error) {
    console.error("Error fetching free featured for user:", error);
    allFeatured.value = [];
    paginationMeta.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.userId, currentPage.value],
  () => {
    fetchUserFeatured();
  },
  { immediate: true },
);
</script>
