<template>
  <section class="users users--announcements">
    <div class="users--announcements__table-wrapper">
      <TableDefault :columns="tableColumns">
        <TableRow v-for="ad in paginatedAds" :key="ad.id">
          <TableCell>
            <div class="users--announcements__gallery">
              <img
                v-if="ad.gallery && ad.gallery.length > 0 && ad.gallery[0]"
                :src="getImageUrl(ad.gallery[0])"
                :alt="ad.name"
                class="users--announcements__gallery__image"
              />
              <span v-else class="users--announcements__gallery__placeholder"
                >-</span
              >
            </div>
          </TableCell>
          <TableCell>
            <div class="users--announcements__name">{{ ad.name }}</div>
          </TableCell>
          <TableCell>{{ formatDate(ad.createdAt) }}</TableCell>
          <TableCell align="right">
            <button
              class="users--announcements__action"
              title="Ver anuncio"
              @click="handleViewAd(ad.id)"
            >
              <Eye class="users--announcements__action__icon" />
            </button>
          </TableCell>
        </TableRow>
      </TableDefault>

      <div
        v-if="paginatedAds.length === 0 && !loading"
        class="users--announcements__empty"
      >
        <p>No se encontraron anuncios</p>
      </div>

      <div v-if="loading" class="users--announcements__loading">
        <p>Cargando anuncios...</p>
      </div>
    </div>

    <PaginationDefault
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-records="totalRecords"
      :page-size="pageSize"
      class="users--announcements__pagination"
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

interface Ad {
  id: number;
  name: string;
  createdAt: string;
  gallery?: Array<{ url: string; formats?: any }>;
}

const props = defineProps<{
  userId: string | number;
}>();

const pageSize = 10;
const currentPage = ref(1);
const allAds = ref<Ad[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const tableColumns = [
  { label: "Galería" },
  { label: "Anuncio" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const paginatedAds = computed(() => allAds.value);

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

const { transformUrl } = useImageProxy();

const getImageUrl = (image: { url: string; formats?: any }) => {
  if (!image) return "";
  const imageUrl = image.formats?.thumbnail?.url || image.url;
  if (!imageUrl) return "";
  return transformUrl(imageUrl);
};

const router = useRouter();

const handleViewAd = (adId: number) => {
  router.push(`/anuncios/${adId}`);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const resolveUserId = () => {
  if (typeof props.userId === "number") return props.userId;
  const parsed = Number(props.userId);
  return Number.isNaN(parsed) ? props.userId : parsed;
};

const fetchUserAds = async () => {
  const userId = resolveUserId();
  if (!userId) {
    allAds.value = [];
    paginationMeta.value = null;
    return;
  }

  try {
    loading.value = true;
    const strapi = useStrapi();
    const response = await strapi.find("ads", {
      filters: {
        user: {
          id: {
            $eq: userId,
          },
        },
      },
      pagination: {
        page: currentPage.value,
        pageSize,
      },
      sort: "createdAt:desc",
      populate: {
        gallery: {
          fields: ["url", "formats"],
        },
      },
    });

    allAds.value = Array.isArray(response.data) ? response.data : [];
    paginationMeta.value = response.meta?.pagination || null;
  } catch (error) {
    console.error("Error fetching user ads:", error);
    allAds.value = [];
    paginationMeta.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  () => [props.userId, currentPage.value],
  () => {
    fetchUserAds();
  },
  { immediate: true },
);
</script>
