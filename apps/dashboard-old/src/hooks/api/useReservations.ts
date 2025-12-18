import { usePaginatedData } from './usePaginatedData';
import {
  getUsedReservations,
  getFreeReservations,
  StrapiAdReservation,
} from '@/lib/strapi';
import { usePreferencesStore } from '@/stores/preferences';

type ReservationType = 'used' | 'free';

interface UseReservationsOptions {
  type: ReservationType;
}

export function useReservations({ type }: UseReservationsOptions) {
  const store = usePreferencesStore();

  const getPreferences = () => {
    switch (type) {
      case 'used':
        return {
          prefs: store.usedReservations,
          setPrefs: store.setUsedReservationsPreferences,
        };
      case 'free':
        return {
          prefs: store.freeReservations,
          setPrefs: store.setFreeReservationsPreferences,
        };
    }
  };

  const getFetchFn = () => {
    switch (type) {
      case 'used':
        return getUsedReservations;
      case 'free':
        return getFreeReservations;
    }
  };

  const { prefs, setPrefs } = getPreferences();
  const fetchFn = getFetchFn();

  return usePaginatedData<StrapiAdReservation>({
    fetchFn,
    preferences: prefs,
    setPreferences: setPrefs,
    defaultSortBy: 'createdAt:desc',
  });
}
