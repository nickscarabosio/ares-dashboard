import { useQuery } from '@tanstack/react-query';
import { fetchTodoistMetrics } from '@/lib/api/todoist';
import { CACHE_CONFIG } from '@/lib/queryClient';

export interface UseTodoistResult {
  projectCount: number;
  totalTasks: number;
  weeklyRevenue: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

export function useTodoist(): UseTodoistResult {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['todoist', 'projects'],
    queryFn: async () => {
      try {
        const metrics = await fetchTodoistMetrics();
        return {
          projectCount: metrics.activeProjects,
          totalTasks: metrics.totalTasks,
          weeklyRevenue: `$${(metrics.weeklyRevenue / 1000).toFixed(1)}K`,
        };
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to fetch Todoist data');
      }
    },
    ...CACHE_CONFIG.todoist,
    enabled: true,
  });

  return {
    projectCount: data?.projectCount || 0,
    totalTasks: data?.totalTasks || 0,
    weeklyRevenue: data?.weeklyRevenue || '$0K',
    isLoading,
    isError,
    error: (error as Error) || null,
    isFetching,
  };
}
