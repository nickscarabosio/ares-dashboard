import { useQuery } from '@tanstack/react-query';
import { fetchCalendarEvents } from '@/lib/api/calendar';
import { CACHE_CONFIG } from '@/lib/queryClient';

export interface UseCalendarResult {
  events: Array<{ id: string; title: string; date: string; time: string }>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

export function useCalendar(): UseCalendarResult {
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['calendar', 'events'],
    queryFn: async () => {
      try {
        const events = await fetchCalendarEvents();
        return events.map(e => ({
          id: `${e.date}-${e.time}`,
          title: e.title,
          date: e.date,
          time: e.time || 'All day',
        }));
      } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to fetch calendar events');
      }
    },
    ...CACHE_CONFIG.calendar,
    enabled: true,
  });

  return {
    events: data || [],
    isLoading,
    isError,
    error: (error as Error) || null,
    isFetching,
  };
}
