import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeals, updateDeal, moveDealStage } from '@/lib/api/crm';
import type { Deal } from '@/lib/api/crm';
import { CACHE_CONFIG } from '@/lib/queryClient';

export interface UseCRMDealsResult {
  deals: Deal[];
  dealsByStage: Record<string, Deal[]>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  updateDeal: (dealId: string, updates: Partial<Deal>) => Promise<Deal>;
  moveDeal: (dealId: string, newStageId: string) => Promise<Deal>;
}

export function useCRMDeals(): UseCRMDealsResult {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['crm', 'deals'],
    queryFn: async () => {
      try {
        const deals = await fetchDeals();
        return deals;
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to fetch CRM deals');
      }
    },
    ...CACHE_CONFIG.todoist,
    enabled: true,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ dealId, updates }: { dealId: string; updates: Partial<Deal> }) => {
      return await updateDeal(dealId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ dealId, newStageId }: { dealId: string; newStageId: string }) => {
      return await moveDealStage(dealId, newStageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
    },
  });

  const dealsByStage: Record<string, Deal[]> = {};
  if (data) {
    data.forEach(deal => {
      const stageLabel = deal.stage?.label || 'Unknown';
      if (!dealsByStage[stageLabel]) {
        dealsByStage[stageLabel] = [];
      }
      dealsByStage[stageLabel].push(deal);
    });
  }

  return {
    deals: data || [],
    dealsByStage,
    isLoading,
    isError,
    error: (error as Error) || null,
    isFetching,
    updateDeal: async (dealId: string, updates: Partial<Deal>) => {
      return updateMutation.mutateAsync({ dealId, updates });
    },
    moveDeal: async (dealId: string, newStageId: string) => {
      return moveMutation.mutateAsync({ dealId, newStageId });
    },
  };
}
