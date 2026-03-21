import { useQuery } from '@tanstack/react-query';
import { fetchObsidianData, formatObsidianDataForDisplay } from '@/lib/api/obsidian';
import { CACHE_CONFIG } from '@/lib/queryClient';

export interface UseObsidianResult {
  agentCount: number;
  activeAgents: number;
  clientCount: number;
  prospectCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

export function useObsidian(): UseObsidianResult {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['obsidian', 'vault'],
    queryFn: async () => {
      try {
        const vaultData = await fetchObsidianData();
        return formatObsidianDataForDisplay(vaultData);
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to fetch Obsidian vault data');
      }
    },
    ...CACHE_CONFIG.obsidian,
    enabled: true,
  });

  return {
    agentCount: data?.agentCount || 0,
    activeAgents: data?.activeAgents || 0,
    clientCount: data?.clientCount || 0,
    prospectCount: data?.prospectCount || 0,
    isLoading,
    isError,
    error: (error as Error) || null,
    isFetching,
  };
}
