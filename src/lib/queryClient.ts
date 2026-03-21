import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export const CACHE_CONFIG = {
  calendar: {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  },
  whoop: {
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  },
  todoist: {
    staleTime: 60 * 60 * 1000,
    gcTime: 3 * 60 * 60 * 1000,
  },
  obsidian: {
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
  },
};
