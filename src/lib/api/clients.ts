import type { Client } from '@/hooks/useClientsData';

export async function fetchClientsFromVault(): Promise<Client[]> {
  try {
    const response = await fetch('/api/clients');
    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}
