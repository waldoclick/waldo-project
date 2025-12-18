import { usePaginatedData } from './usePaginatedData';
import { getCategories, StrapiCategory } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useCategories() {
  const { categories: categoriesPrefs, setCategoriesPreferences } =
    usePreferencesStore();

  return usePaginatedData<StrapiCategory>({
    fetchFn: getCategories,
    preferences: categoriesPrefs,
    setPreferences: setCategoriesPreferences,
    defaultSortBy: 'name:asc',
  });
}
