import { useState, useEffect, useCallback, useRef } from 'react';

interface PaginatedDataPreferences {
  pageSize: number;
  sortBy: string;
  searchTerm: string;
}

interface UsePaginatedDataOptions<T> {
  fetchFn: (params: {
    page: number;
    pageSize: number;
    sort: string;
    search?: string;
  }) => Promise<{
    data: T[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  }>;
  preferences: PaginatedDataPreferences;
  setPreferences: (prefs: Partial<PaginatedDataPreferences>) => void;
  defaultSortBy?: string;
  autoFetch?: boolean;
  onDataLoaded?: (data: T[], sortBy: string) => T[]; // Para transformaciones post-fetch (ej: ordenar destacadas)
}

export function usePaginatedData<T>({
  fetchFn,
  preferences,
  setPreferences,
  defaultSortBy = 'createdAt:desc',
  autoFetch = true,
  onDataLoaded,
}: UsePaginatedDataOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasInitializedRef = useRef(false);
  const lastSavedRef = useRef({
    searchTerm: '',
    pageSize: 25,
    sortBy: defaultSortBy,
  });

  // Cargar preferencias al montar el componente (solo una vez)
  useEffect(() => {
    if (!hasInitializedRef.current && preferences) {
      setSearchTerm(preferences.searchTerm || '');
      setPageSize(preferences.pageSize || 25);
      setSortBy(preferences.sortBy || defaultSortBy);
      lastSavedRef.current = {
        searchTerm: preferences.searchTerm || '',
        pageSize: preferences.pageSize || 25,
        sortBy: preferences.sortBy || defaultSortBy,
      };
      setIsInitialized(true);
      hasInitializedRef.current = true;
    }
  }, [
    preferences?.searchTerm,
    preferences?.pageSize,
    preferences?.sortBy,
    defaultSortBy,
    preferences,
  ]);

  // Guardar preferencias cuando cambien (solo después de la inicialización)
  useEffect(() => {
    if (!isInitialized) return;

    // Solo actualizar si los valores realmente cambiaron desde la última vez que guardamos
    const hasChanged =
      lastSavedRef.current.searchTerm !== searchTerm ||
      lastSavedRef.current.pageSize !== pageSize ||
      lastSavedRef.current.sortBy !== sortBy;

    if (hasChanged) {
      lastSavedRef.current = { searchTerm, pageSize, sortBy };
      setPreferences({
        searchTerm,
        pageSize,
        sortBy,
      });
    }
  }, [searchTerm, pageSize, sortBy, setPreferences, isInitialized]);

  // Reset to page 1 when search term, page size, or sort changes
  useEffect(() => {
    if (!isInitialized) return;
    setCurrentPage(1);
  }, [searchTerm, pageSize, sortBy, isInitialized]);

  // Fetch data
  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFn({
        page: currentPage,
        pageSize,
        sort: sortBy,
        search: searchTerm || undefined,
      });

      let processedData = response.data;
      if (onDataLoaded) {
        processedData = onDataLoaded(response.data, sortBy);
      }

      setData(processedData);
      setTotalPages(response.meta.pagination.pageCount);
      setTotalItems(response.meta.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, pageSize, sortBy, fetchFn, onDataLoaded]);

  // Auto-fetch when relevant values change
  useEffect(() => {
    if (!isInitialized || !autoFetch) return;
    fetch();
  }, [isInitialized, autoFetch, fetch]);

  return {
    data,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    sortBy,
    setSortBy,
    refetch: fetch,
  };
}
