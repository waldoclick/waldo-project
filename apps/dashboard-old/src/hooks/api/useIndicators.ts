import { useState, useEffect, useCallback } from 'react';
import { getIndicators, Indicator } from '@/lib/strapi/indicators';

export function useIndicators() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIndicators = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getIndicators();
      setIndicators(response.data);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Error al obtener indicadores');
      setError(error);
      console.error('Error fetching indicators:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  return {
    indicators,
    loading,
    error,
    refetch: fetchIndicators,
  };
}
