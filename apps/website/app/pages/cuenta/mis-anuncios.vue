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
import { ref, onMounted, watch } from "vue";
import AccountAnnouncements from "@/components/AccountAnnouncements.vue";
import type { Ad } from "@/types/ad";
import { useUserStore } from "@/stores/user.store";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-vue-next";

type FilterType = "published" | "review" | "expired" | "rejected";

const tabs = ref<
  { value: FilterType; label: string; count: number; icon: any }[]
>([
  { value: "published", label: "Publicados", count: 0, icon: CheckCircle },
  { value: "review", label: "En revisión", count: 0, icon: Clock },
  { value: "expired", label: "Expirados", count: 0, icon: AlertCircle },
  { value: "rejected", label: "Rechazados", count: 0, icon: XCircle },
]);

const ads = ref<Ad[]>([]); // Asegúrate de que esta línea esté correctamente escrita

const currentFilter = ref<FilterType>("published");
const currentPage = ref(1);
const pagination = ref({ total: 0, pageSize: 10 });
const isLoading = ref(false);

const userStore = useUserStore();

const loadAds = async () => {
  isLoading.value = true;
  try {
    const response = await userStore.loadUserAds(
      { status: currentFilter.value },
      { page: currentPage.value, pageSize: pagination.value.pageSize },
      ["createdAt:desc"] as unknown as never[], // Pasar el sort como un parámetro separado
    );

    if (response) {
      ads.value = response.data as unknown as Ad[]; // Asegúrate de que esta línea esté correctamente escrita
      const total = response.meta.pagination.total;
      pagination.value.total = total;

      // Actualizar el count del tab correspondiente
      const tabToUpdate = tabs.value.find(
        (tab) => tab.value === currentFilter.value,
      );
      if (tabToUpdate) {
        tabToUpdate.count = total;
      }
    }
  } catch (error) {
    console.error("Error loading ads:", error);
  } finally {
    isLoading.value = false;
  }
};

const loadTabCounts = async () => {
  isLoading.value = true;

  try {
    const promises = tabs.value.map(async (tab) => {
      const response = await userStore.loadUserAds(
        { status: tab.value },
        { page: 1, pageSize: 10 }, // Asegurar paginación básica
        ["createdAt:desc"] as never[], // Pasar el sort como un parámetro separado
      );
      if (response) {
        tab.count = response.meta.pagination.total; // Actualizar el count del tab
      }
    });
    await Promise.all(promises); // Esperar a que todas las promesas se resuelvan
  } catch (error) {
    console.error("Error loading tab counts:", error);
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

// Observa cambios en currentFilter y currentPage y recarga los anuncios automáticamente
watch([currentFilter, currentPage], () => {
  loadAds();
});

useAsyncData(async () => {
  await loadTabCounts(); // Cargar los totales de los tabs al iniciar
  await loadAds(); // Cargar los anuncios del filtro actual
});

definePageMeta({
  layout: "account",
  middleware: "auth",
});
</script>
