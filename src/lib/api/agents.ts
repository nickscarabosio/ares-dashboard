import type { Agent } from '@/hooks/useAgentsData';

export async function fetchAgentsFromVault(): Promise<Agent[]> {
  try {
    const response = await fetch('/api/agents');
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
}
