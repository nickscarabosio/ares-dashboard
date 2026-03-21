import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGoals, createSprint, updateTarget, deleteSprint } from '@/lib/api/goals';

export interface Target {
  id: string;
  name: string;
  target: number;
  completed: number;
  updated_at: string;
}

export interface Sprint {
  sprint_id: string;
  name: string;
  start_date: string;
  end_date: string;
  current: boolean;
  targets: {
    fitness: Target[];
    flow: Target[];
    family: Target[];
    finance: Target[];
  };
}

export interface UseGoalsResult {
  sprints: Sprint[];
  currentSprint: Sprint | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  createSprintMutation: any;
  updateTargetMutation: any;
  deleteSprintMutation: any;
}

export function useGoals(): UseGoalsResult {
  const queryClient = useQueryClient();

  const { data: sprints = [], isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['goals', 'sprints'],
    queryFn: async () => {
      try {
        return fetchGoals();
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to fetch goals');
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: true,
  });

  const currentSprint = sprints.find((s) => s.current);

  const createSprintMutation = useMutation({
    mutationFn: (sprint: Sprint) => createSprint(sprint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', 'sprints'] });
    },
  });

  const updateTargetMutation = useMutation({
    mutationFn: ({ sprintId, category, targetId, completed }: {
      sprintId: string;
      category: 'fitness' | 'flow' | 'family' | 'finance';
      targetId: string;
      completed: number;
    }) => updateTarget(sprintId, category, targetId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', 'sprints'] });
    },
  });

  const deleteSprintMutation = useMutation({
    mutationFn: (sprintId: string) => deleteSprint(sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', 'sprints'] });
    },
  });

  return {
    sprints,
    currentSprint,
    isLoading,
    isError,
    error: (error as Error) || null,
    isFetching,
    createSprintMutation,
    updateTargetMutation,
    deleteSprintMutation,
  };
}
