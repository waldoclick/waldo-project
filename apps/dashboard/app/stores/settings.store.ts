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
  reservations: SectionSettings;
  featured: SectionSettings;
  categories: SectionSettings;
  conditions: SectionSettings;
  faqs: SectionSettings;
  packs: SectionSettings;
  regions: SectionSettings;
  communes: SectionSettings;
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
    const reservations = ref<SectionSettings>({ ...defaultSectionSettings });
    const featured = ref<SectionSettings>({ ...defaultSectionSettings });
    const categories = ref<SectionSettings>({ ...defaultSectionSettings });
    const conditions = ref<SectionSettings>({ ...defaultSectionSettings });
    const faqs = ref<SectionSettings>({ ...defaultSectionSettings });
    const packs = ref<SectionSettings>({ ...defaultSectionSettings });
    const regions = ref<SectionSettings>({ ...defaultSectionSettings });
    const communes = ref<SectionSettings>({ ...defaultSectionSettings });

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

    const getReservationsFilters = computed(() => ({
      sortBy: reservations.value.sortBy,
      pageSize: reservations.value.pageSize,
    }));

    const getFeaturedFilters = computed(() => ({
      sortBy: featured.value.sortBy,
      pageSize: featured.value.pageSize,
    }));

    const getCategoriesFilters = computed(() => ({
      sortBy: categories.value.sortBy,
      pageSize: categories.value.pageSize,
    }));

    const getConditionsFilters = computed(() => ({
      sortBy: conditions.value.sortBy,
      pageSize: conditions.value.pageSize,
    }));

    const getFaqsFilters = computed(() => ({
      sortBy: faqs.value.sortBy,
      pageSize: faqs.value.pageSize,
    }));

    const getPacksFilters = computed(() => ({
      sortBy: packs.value.sortBy,
      pageSize: packs.value.pageSize,
    }));

    const getRegionsFilters = computed(() => ({
      sortBy: regions.value.sortBy,
      pageSize: regions.value.pageSize,
    }));

    const getCommunesFilters = computed(() => ({
      sortBy: communes.value.sortBy,
      pageSize: communes.value.pageSize,
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
        case "reservations":
          return reservations;
        case "featured":
          return featured;
        case "categories":
          return categories;
        case "conditions":
          return conditions;
        case "faqs":
          return faqs;
        case "packs":
          return packs;
        case "regions":
          return regions;
        case "communes":
          return communes;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
    }

    return {
      // State
      orders,
      ads,
      users,
      reservations,
      featured,
      categories,
      conditions,
      faqs,
      packs,
      regions,
      communes,
      // Getters
      getOrdersFilters,
      getAdsFilters,
      getUsersFilters,
      getReservationsFilters,
      getFeaturedFilters,
      getCategoriesFilters,
      getConditionsFilters,
      getFaqsFilters,
      getPacksFilters,
      getRegionsFilters,
      getCommunesFilters,
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
