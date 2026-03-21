import { useQuery } from '@tanstack/react-query';
import { fetchAgentsFromVault } from '@/lib/api/agents';

export interface Agent {
  name: string;
  status: 'active' | 'idle' | 'offline';
  task_count: number;
  last_activity?: string;
  avatar_color?: string;
}

export interface UseAgentsDataResult {
  agents: Agent[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

export function useAgentsData(): UseAgentsDataResult {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['obsidian', 'agents'],
    queryFn: async () => {
      try {
        return fetchAgentsFromVault();
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to fetch agents from Obsidian vault');
      }
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    enabled: true,
  });

  return {
    agents: data || [],
    isLoading,
    isError,
    error: (error as Error) || null,
    isFetching,
  };
}
