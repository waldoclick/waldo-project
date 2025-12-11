import { usePaginatedData } from './usePaginatedData';
import { getRegions, StrapiRegion } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function useRegions() {
  const { regions: regionsPrefs, setRegionsPreferences } =
    usePreferencesStore();

  return usePaginatedData<StrapiRegion>({
    fetchFn: getRegions,
    preferences: regionsPrefs,
    setPreferences: setRegionsPreferences,
    defaultSortBy: 'name:asc',
  });
}
