import { usePaginatedData } from './usePaginatedData';
import { getConditions, StrapiCondition } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useConditions() {
  const { conditions: conditionsPrefs, setConditionsPreferences } =
    usePreferencesStore();

  return usePaginatedData<StrapiCondition>({
    fetchFn: getConditions,
    preferences: conditionsPrefs,
    setPreferences: setConditionsPreferences,
    defaultSortBy: 'name:asc',
  });
}
