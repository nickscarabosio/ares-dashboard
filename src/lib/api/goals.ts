import type { Sprint } from '@/hooks/useGoals';

const GOALS_STORAGE_KEY = 'ares_goals_sprints';

export async function fetchGoals(): Promise<Sprint[]> {
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    return [
      {
        sprint_id: 'Q2_2026',
        name: 'Q2 2026',
        start_date: '2026-04-01',
        end_date: '2026-06-30',
        current: true,
        targets: {
          fitness: [
            { id: 'fit_1', name: 'BJJ Sessions', target: 24, completed: 18, updated_at: new Date().toISOString() },
            { id: 'fit_2', name: 'Zone 2 Runs', target: 12, completed: 10, updated_at: new Date().toISOString() },
            { id: 'fit_3', name: 'Mobility', target: 8, completed: 7, updated_at: new Date().toISOString() },
          ],
          flow: [
            { id: 'flow_1', name: 'Energy Score', target: 8, completed: 7, updated_at: new Date().toISOString() },
            { id: 'flow_2', name: 'Weekly Reflections', target: 13, completed: 12, updated_at: new Date().toISOString() },
          ],
          family: [
            { id: 'fam_1', name: 'Family Time (hrs)', target: 20, completed: 18, updated_at: new Date().toISOString() },
            { id: 'fam_2', name: 'Date Nights', target: 8, completed: 6, updated_at: new Date().toISOString() },
          ],
          finance: [
            { id: 'fin_1', name: 'MRR ($K)', target: 45, completed: 42, updated_at: new Date().toISOString() },
            { id: 'fin_2', name: 'Pipeline ($K)', target: 150, completed: 145, updated_at: new Date().toISOString() },
          ],
        },
      },
    ];
  } catch (error) {
    console.error('Failed to fetch goals:', error);
    return [];
  }
}

export async function createSprint(sprint: Sprint): Promise<Sprint> {
  try {
    const sprints = await fetchGoals();
    sprints.forEach((s) => {
      if (s.current) s.current = false;
    });
    sprints.push(sprint);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(sprints));
    return sprint;
  } catch (error) {
    console.error('Failed to create sprint:', error);
    throw error;
  }
}

export async function updateTarget(
  sprintId: string,
  category: 'fitness' | 'flow' | 'family' | 'finance',
  targetId: string,
  completed: number
): Promise<void> {
  try {
    const sprints = await fetchGoals();
    const sprint = sprints.find((s) => s.sprint_id === sprintId);
    if (!sprint) throw new Error('Sprint not found');

    const target = sprint.targets[category].find((t) => t.id === targetId);
    if (!target) throw new Error('Target not found');

    target.completed = completed;
    target.updated_at = new Date().toISOString();

    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(sprints));
  } catch (error) {
    console.error('Failed to update target:', error);
    throw error;
  }
}

export async function deleteSprint(sprintId: string): Promise<void> {
  try {
    const sprints = await fetchGoals();
    const filtered = sprints.filter((s) => s.sprint_id !== sprintId);
    if (!filtered.find((s) => s.current) && filtered.length > 0) {
      filtered[0].current = true;
    }
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete sprint:', error);
    throw error;
  }
}
