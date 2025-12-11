import { usePaginatedData } from './usePaginatedData';
import { getFaqs, StrapiFaq } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useFaqs() {
  const { faqs: faqsPrefs, setFaqsPreferences } = usePreferencesStore();

  return usePaginatedData<StrapiFaq>({
    fetchFn: async (params) => {
      // Si sortBy es 'featured:desc', no enviar sort al backend
      const backendSort =
        params.sort === 'featured:desc' ? undefined : params.sort;
      return getFaqs({
        page: params.page,
        pageSize: params.pageSize,
        sort: backendSort,
        search: params.search,
      });
    },
    preferences: faqsPrefs,
    setPreferences: setFaqsPreferences,
    defaultSortBy: 'createdAt:desc',
    onDataLoaded: (data, sortBy) => {
      // Si se seleccionó "Destacadas primero", ordenar en el frontend
      if (sortBy === 'featured:desc') {
        return [...data].sort((a, b) => {
          // Primero ordenar por destacada (true primero)
          if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
          }
          // Si ambas tienen el mismo estado de destacada, mantener el orden por fecha (más recientes primero)
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      return data;
    },
  });
}
