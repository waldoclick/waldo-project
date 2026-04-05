<template>
  <div class="page">
    <AccountAnnouncements
      :intro-text="'Aquí podrás ver el estado de tus publicaciones, revisar los anuncios pendientes de aprobación y dar seguimiento a todo tu contenido.'"
      :ads="ads"
      :current-filter="currentFilter"
      :current-page="currentPage"
      :pagination="pagination"
      :is-loading="isLoading"
      :tabs="tabs"
      @filter-change="handleFilterChange"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import AccountAnnouncements from "@/components/AccountAnnouncements.vue";
import type { Ad } from "@/types/ad";
import { useUserStore } from "@/stores/user.store";
import { CheckCircle, Clock, AlertCircle, XCircle, Ban } from "lucide-vue-next";

type FilterType = "published" | "review" | "expired" | "rejected" | "banned";

const tabs = ref<
  { value: FilterType; label: string; count: number; icon: any }[]
>([
  { value: "published", label: "Activos", count: 0, icon: CheckCircle },
  { value: "review", label: "En revisión", count: 0, icon: Clock },
  { value: "expired", label: "Expirados", count: 0, icon: AlertCircle },
  { value: "rejected", label: "Rechazados", count: 0, icon: XCircle },
  { value: "banned", label: "Baneados", count: 0, icon: Ban },
]);

const ads = ref<Ad[]>([]);

const currentFilter = ref<FilterType>("published");
const currentPage = ref(1);
const pagination = ref({ total: 0, pageSize: 10 });
const isLoading = ref(false);

const userStore = useUserStore();

const loadAds = async () => {
  isLoading.value = true;
  try {
    const response = await userStore.loadUserAds(
      currentFilter.value,
      { page: currentPage.value, pageSize: pagination.value.pageSize },
      ["createdAt:desc"] as unknown as never[], // pass sort as a separate parameter
    );

    if (response) {
      ads.value = response.data as unknown as Ad[];
      const total = response.meta.pagination.total;
      pagination.value.total = total;
    }
  } catch (error) {
    console.error("Error loading ads:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleFilterChange = (filter: FilterType) => {
  currentFilter.value = filter;
  currentPage.value = 1;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// Re-fetch ads when filter or page changes
watch([currentFilter, currentPage], () => {
  loadAds();
});

useAsyncData(async () => {
  const counts = await userStore.loadUserAdCounts();
  for (const tab of tabs.value) {
    tab.count = counts[tab.value] ?? 0;
  }
  await loadAds();
});

definePageMeta({
  layout: "account",
  middleware: "auth",
});

const { $setSEO } = useNuxtApp();

$setSEO({
  title: "Mis Anuncios",
  description: "Gestiona tus anuncios activos y archivados en Waldo.click®.",
});
useSeoMeta({ robots: "noindex, nofollow" });
</script>
