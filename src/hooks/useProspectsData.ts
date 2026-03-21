import { useQuery } from '@tanstack/react-query';
import { fetchProspectsFromVault } from '@/lib/api/prospects';

export interface Prospect {
  prospect_id: string;
  name: string;
  company?: string;
  deal_size: number;
  stage: 'inquiry' | 'qualified' | 'proposal' | 'won';
  contact_email?: string;
  contact_person?: string;
  close_date?: string;
  notes?: string;
}

export interface UseProspectsDataResult {
  prospects: Prospect[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

export function useProspectsData(): UseProspectsDataResult {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['obsidian', 'prospects'],
    queryFn: async () => {
      try {
        return fetchProspectsFromVault();
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to fetch prospects from Obsidian vault');
      }
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    enabled: true,
  });

  return {
    prospects: data || [],
    isLoading,
    isError,
    error: (error as Error) || null,
    isFetching,
  };
}
