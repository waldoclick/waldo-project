import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface SectionSettings {
  searchTerm: string;
  sortBy: string;
  pageSize: number;
  currentPage: number;
}

interface SettingsState {
  orders: SectionSettings;
  ads: SectionSettings;
  users: SectionSettings;
  // Agregar más secciones según se necesiten
}

const defaultSectionSettings: SectionSettings = {
  searchTerm: "",
  sortBy: "createdAt:desc",
  pageSize: 25,
  currentPage: 1,
};

export const useSettingsStore = defineStore(
  "settings",
  () => {
    // State
    const orders = ref<SectionSettings>({ ...defaultSectionSettings });
    const ads = ref<SectionSettings>({ ...defaultSectionSettings });
    const users = ref<SectionSettings>({ ...defaultSectionSettings });

    // Getters para cada sección
    const getOrdersFilters = computed(() => ({
      sortBy: orders.value.sortBy,
      pageSize: orders.value.pageSize,
    }));

    const getAdsFilters = computed(() => ({
      sortBy: ads.value.sortBy,
      pageSize: ads.value.pageSize,
    }));

    const getUsersFilters = computed(() => ({
      sortBy: users.value.sortBy,
      pageSize: users.value.pageSize,
    }));

    // Actions genéricas para cualquier sección
    function setSearchTerm(section: keyof SettingsState, term: string): void {
      const sectionSettings = getSectionSettings(section);
      sectionSettings.value.searchTerm = term;
      sectionSettings.value.currentPage = 1; // Reset page when searching
    }

    function setSortBy(section: keyof SettingsState, sortBy: string): void {
      const sectionSettings = getSectionSettings(section);
      sectionSettings.value.sortBy = sortBy;
      sectionSettings.value.currentPage = 1; // Reset page when sorting changes
    }

    function setPageSize(section: keyof SettingsState, pageSize: number): void {
      const sectionSettings = getSectionSettings(section);
      sectionSettings.value.pageSize = pageSize;
      sectionSettings.value.currentPage = 1; // Reset page when page size changes
    }

    function setCurrentPage(section: keyof SettingsState, page: number): void {
      const sectionSettings = getSectionSettings(section);
      sectionSettings.value.currentPage = page;
    }

    function setFilters(
      section: keyof SettingsState,
      filters: { sortBy: string; pageSize: number },
    ): void {
      const sectionSettings = getSectionSettings(section);
      sectionSettings.value.sortBy = filters.sortBy;
      sectionSettings.value.pageSize = filters.pageSize;
      sectionSettings.value.currentPage = 1; // Reset page when filters change
    }

    function resetSection(section: keyof SettingsState): void {
      const sectionSettings = getSectionSettings(section);
      sectionSettings.value = { ...defaultSectionSettings };
    }

    // Helper function para obtener el ref de la sección
    function getSectionSettings(section: keyof SettingsState) {
      switch (section) {
        case "orders":
          return orders;
        case "ads":
          return ads;
        case "users":
          return users;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
    }

    return {
      // State
      orders,
      ads,
      users,
      // Getters
      getOrdersFilters,
      getAdsFilters,
      getUsersFilters,
      // Actions
      setSearchTerm,
      setSortBy,
      setPageSize,
      setCurrentPage,
      setFilters,
      resetSection,
    };
  },
  {
    persist: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      key: "settings",
    },
  },
);
