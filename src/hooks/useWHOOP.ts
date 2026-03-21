import { useQuery } from '@tanstack/react-query';
import { fetchWHOOPMetrics } from '@/lib/api/whoop';
import { CACHE_CONFIG } from '@/lib/queryClient';

export interface UseWhoopResult {
  fitnessScore: string;
  sleep: string;
  strain: string;
  recovery: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

export function useWHOOP(): UseWhoopResult {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['whoop', 'fitness'],
    queryFn: async () => {
      try {
        const metrics = await fetchWHOOPMetrics();
        return {
          fitnessScore: metrics.fitnessScore.toFixed(1),
          sleep: `${metrics.sleep.toFixed(1)}h`,
          strain: `${metrics.strain.toFixed(1)}`,
          recovery: `${Math.round(metrics.recovery)}%`,
        };
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to fetch WHOOP data');
      }
    },
    ...CACHE_CONFIG.whoop,
    enabled: true,
  });

  return {
    fitnessScore: data?.fitnessScore || '—',
    sleep: data?.sleep || '—',
    strain: data?.strain || '—',
    recovery: data?.recovery || '—',
    isLoading,
    isError,
    error: (error as Error) || null,
    isFetching,
  };
}
