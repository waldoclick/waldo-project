import { usePaginatedData } from './usePaginatedData';
import { getCommunes, StrapiCommune } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useCommunes() {
  const { communes: communesPrefs, setCommunesPreferences } =
    usePreferencesStore();

  return usePaginatedData<StrapiCommune>({
    fetchFn: getCommunes,
    preferences: communesPrefs,
    setPreferences: setCommunesPreferences,
    defaultSortBy: 'name:asc',
  });
}
