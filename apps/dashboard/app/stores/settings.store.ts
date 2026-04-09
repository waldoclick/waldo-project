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
  adsPendings: SectionSettings;
  adsActives: SectionSettings;
  adsArchived: SectionSettings;
  adsBanned: SectionSettings;
  adsRejected: SectionSettings;
  adsAbandoned: SectionSettings;
  adsDraft: SectionSettings;
  users: SectionSettings;
  reservations: SectionSettings;
  featured: SectionSettings;
  categories: SectionSettings;
  conditions: SectionSettings;
  faqs: SectionSettings;
  policies: SectionSettings;
  terms: SectionSettings;
  packs: SectionSettings;
  regions: SectionSettings;
  subscriptionPayments: SectionSettings;
  subscriptionPros: SectionSettings;
  communes: SectionSettings;
  articles: SectionSettings;
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
    const adsPendings = ref<SectionSettings>({ ...defaultSectionSettings });
    const adsActives = ref<SectionSettings>({ ...defaultSectionSettings });
    const adsArchived = ref<SectionSettings>({ ...defaultSectionSettings });
    const adsBanned = ref<SectionSettings>({ ...defaultSectionSettings });
    const adsRejected = ref<SectionSettings>({ ...defaultSectionSettings });
    const adsAbandoned = ref<SectionSettings>({ ...defaultSectionSettings });
    const adsDraft = ref<SectionSettings>({ ...defaultSectionSettings });
    const users = ref<SectionSettings>({ ...defaultSectionSettings });
    const reservations = ref<SectionSettings>({ ...defaultSectionSettings });
    const featured = ref<SectionSettings>({ ...defaultSectionSettings });
    const categories = ref<SectionSettings>({ ...defaultSectionSettings });
    const conditions = ref<SectionSettings>({ ...defaultSectionSettings });
    const faqs = ref<SectionSettings>({ ...defaultSectionSettings });
    const policies = ref<SectionSettings>({
      ...defaultSectionSettings,
      sortBy: "order:asc",
    });
    const terms = ref<SectionSettings>({
      ...defaultSectionSettings,
      sortBy: "order:asc",
    });
    const packs = ref<SectionSettings>({ ...defaultSectionSettings });
    const regions = ref<SectionSettings>({ ...defaultSectionSettings });
    const subscriptionPayments = ref<SectionSettings>({
      ...defaultSectionSettings,
    });
    const subscriptionPros = ref<SectionSettings>({
      ...defaultSectionSettings,
    });
    const communes = ref<SectionSettings>({ ...defaultSectionSettings });
    const articles = ref<SectionSettings>({ ...defaultSectionSettings });

    // Getters para cada sección
    const getOrdersFilters = computed(() => ({
      sortBy: orders.value.sortBy,
      pageSize: orders.value.pageSize,
    }));

    const getAdsPendingsFilters = computed(() => ({
      sortBy: adsPendings.value.sortBy,
      pageSize: adsPendings.value.pageSize,
    }));

    const getAdsActivesFilters = computed(() => ({
      sortBy: adsActives.value.sortBy,
      pageSize: adsActives.value.pageSize,
    }));

    const getAdsArchivedFilters = computed(() => ({
      sortBy: adsArchived.value.sortBy,
      pageSize: adsArchived.value.pageSize,
    }));

    const getAdsBannedFilters = computed(() => ({
      sortBy: adsBanned.value.sortBy,
      pageSize: adsBanned.value.pageSize,
    }));

    const getAdsRejectedFilters = computed(() => ({
      sortBy: adsRejected.value.sortBy,
      pageSize: adsRejected.value.pageSize,
    }));

    const getAdsAbandonedFilters = computed(() => ({
      sortBy: adsAbandoned.value.sortBy,
      pageSize: adsAbandoned.value.pageSize,
    }));

    const getAdsDraftFilters = computed(() => ({
      sortBy: adsDraft.value.sortBy,
      pageSize: adsDraft.value.pageSize,
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

    const getPoliciesFilters = computed(() => ({
      sortBy: policies.value.sortBy,
      pageSize: policies.value.pageSize,
    }));

    const getTermsFilters = computed(() => ({
      sortBy: terms.value.sortBy,
      pageSize: terms.value.pageSize,
    }));

    const getPacksFilters = computed(() => ({
      sortBy: packs.value.sortBy,
      pageSize: packs.value.pageSize,
    }));

    const getSubscriptionPaymentsFilters = computed(() => ({
      sortBy: subscriptionPayments.value.sortBy,
      pageSize: subscriptionPayments.value.pageSize,
    }));

    const getSubscriptionProsFilters = computed(() => ({
      sortBy: subscriptionPros.value.sortBy,
      pageSize: subscriptionPros.value.pageSize,
    }));

    const getRegionsFilters = computed(() => ({
      sortBy: regions.value.sortBy,
      pageSize: regions.value.pageSize,
    }));

    const getCommunesFilters = computed(() => ({
      sortBy: communes.value.sortBy,
      pageSize: communes.value.pageSize,
    }));

    const getArticlesFilters = computed(() => ({
      sortBy: articles.value.sortBy,
      pageSize: articles.value.pageSize,
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
        case "adsPendings":
          return adsPendings;
        case "adsActives":
          return adsActives;
        case "adsArchived":
          return adsArchived;
        case "adsBanned":
          return adsBanned;
        case "adsRejected":
          return adsRejected;
        case "adsAbandoned":
          return adsAbandoned;
        case "adsDraft":
          return adsDraft;
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
        case "policies":
          return policies;
        case "terms":
          return terms;
        case "packs":
          return packs;
        case "regions":
          return regions;
        case "subscriptionPayments":
          return subscriptionPayments;
        case "subscriptionPros":
          return subscriptionPros;
        case "communes":
          return communes;
        case "articles":
          return articles;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
    }

    return {
      // State
      orders,
      adsPendings,
      adsActives,
      adsArchived,
      adsBanned,
      adsRejected,
      adsAbandoned,
      adsDraft,
      users,
      reservations,
      featured,
      categories,
      conditions,
      faqs,
      policies,
      terms,
      packs,
      regions,
      communes,
      articles,
      subscriptionPayments,
      subscriptionPros,
      // Getters
      getOrdersFilters,
      getAdsPendingsFilters,
      getAdsActivesFilters,
      getAdsArchivedFilters,
      getAdsBannedFilters,
      getAdsRejectedFilters,
      getAdsAbandonedFilters,
      getAdsDraftFilters,
      getUsersFilters,
      getReservationsFilters,
      getFeaturedFilters,
      getCategoriesFilters,
      getConditionsFilters,
      getFaqsFilters,
      getPoliciesFilters,
      getTermsFilters,
      getPacksFilters,
      getSubscriptionPaymentsFilters,
      getSubscriptionProsFilters,
      getRegionsFilters,
      getCommunesFilters,
      getArticlesFilters,
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
