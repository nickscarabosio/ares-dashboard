import type { Prospect } from '@/hooks/useProspectsData';

export async function fetchProspectsFromVault(): Promise<Prospect[]> {
  try {
    const response = await fetch('/api/prospects');
    if (!response.ok) {
      throw new Error(`Failed to fetch prospects: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching prospects:', error);
    return [];
  }
}
