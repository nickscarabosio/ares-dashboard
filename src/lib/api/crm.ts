export interface Deal {
  id: string;
  title: string;
  owner: string;
  value: number;
  stage: {
    id: string;
    label: string;
    weight: number;
    color: string;
  };
  status: string;
  email?: string;
  followUpDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  goal?: string | null;
}

export interface PipelineStage {
  id: string;
  name: string;
}

function getCRMToken(): string {
  const token = process.env.NEXT_PUBLIC_CRM_API_KEY;
  if (!token) {
    throw new Error('CRM API key not configured. Set NEXT_PUBLIC_CRM_API_KEY in environment.');
  }
  return token;
}

export async function fetchDeals(status?: string, stage?: string): Promise<Deal[]> {
  try {
    const baseUrl = '/api/deals';

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (stage) params.append('stage', stage);

    const url = params.toString() ? `${baseUrl}?${params}` : baseUrl;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 401) throw new Error('CRM: Unauthorized (invalid API key)');
    if (response.status === 429) throw new Error('CRM: Rate limited. Please try again later.');
    if (!response.ok) throw new Error(`CRM: HTTP ${response.status}`);

    const deals = await response.json();
    return Array.isArray(deals) ? deals : [];
  } catch (error) {
    console.error('Failed to fetch deals from CRM:', error);
    throw error;
  }
}

export async function fetchDeal(dealId: string): Promise<Deal> {
  try {
    const token = getCRMToken();
    const response = await fetch(`https://crm.nickscarabosio.com/api/deals/${dealId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (response.status === 401) throw new Error('CRM: Unauthorized');
    if (!response.ok) throw new Error(`CRM: HTTP ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch deal ${dealId}:`, error);
    throw error;
  }
}

export async function updateDeal(dealId: string, updates: Partial<Deal>): Promise<Deal> {
  try {
    const token = getCRMToken();

    const response = await fetch(`https://crm.nickscarabosio.com/api/deals/${dealId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (response.status === 401) throw new Error('CRM: Unauthorized');
    if (response.status === 409) throw new Error('CRM: Conflict (deal may have been modified)');
    if (!response.ok) throw new Error(`CRM: HTTP ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error(`Failed to update deal ${dealId}:`, error);
    throw error;
  }
}

export async function moveDealStage(dealId: string, newStageId: string, notes?: string): Promise<Deal> {
  return updateDeal(dealId, {
    stage: { id: newStageId } as any,
    notes: notes || undefined,
  });
}

export async function createReminder(
  dealId: string,
  title: string,
  dueDate: string,
  type: string = 'follow_up',
  description?: string
): Promise<any> {
  try {
    const token = getCRMToken();

    const response = await fetch('https://crm.nickscarabosio.com/api/reminders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dealId, title, dueDate, type, description }),
    });

    if (!response.ok) throw new Error(`CRM Reminder: HTTP ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Failed to create reminder:', error);
    throw error;
  }
}
