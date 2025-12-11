import { usePaginatedData } from './usePaginatedData';
import { getAdPacks, StrapiAdPack } from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

export function usePacks() {
  const { packs: packsPrefs, setPacksPreferences } = usePreferencesStore();

  return usePaginatedData<StrapiAdPack>({
    fetchFn: getAdPacks,
    preferences: packsPrefs,
    setPreferences: setPacksPreferences,
    defaultSortBy: 'name:asc',
  });
}
