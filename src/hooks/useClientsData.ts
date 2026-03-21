import { useQuery } from '@tanstack/react-query';
import { fetchClientsFromVault } from '@/lib/api/clients';

export interface Client {
  client_id: string;
  name: string;
  status: 'active' | 'paused' | 'prospect';
  revenue?: number;
  mrr?: number;
  last_contact?: string;
  next_action?: string;
  contact_email?: string;
  notes?: string;
}

export interface UseClientsDataResult {
  clients: Client[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

export function useClientsData(): UseClientsDataResult {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['obsidian', 'clients'],
    queryFn: async () => {
      try {
        return fetchClientsFromVault();
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to fetch clients from Obsidian vault');
      }
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    enabled: true,
  });

  return {
    clients: data || [],
    isLoading,
    isError,
    error: (error as Error) || null,
    isFetching,
  };
}
