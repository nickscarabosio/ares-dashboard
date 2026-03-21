export interface AgentStatus {
  name: string;
  status: 'active' | 'idle' | 'offline';
  lastSync: string;
  tasksCount?: number;
}

export interface ClientInfo {
  name: string;
  status: 'prospect' | 'qualified' | 'active' | 'inactive';
  revenue?: number;
  dealStage?: string;
}

export interface ObsidianData {
  agents: AgentStatus[];
  clients: ClientInfo[];
  prospects: ClientInfo[];
}

export async function fetchObsidianData(): Promise<ObsidianData> {
  try {
    const [agentsResponse, clientsResponse, prospectsResponse] = await Promise.all([
      fetch('/api/agents'),
      fetch('/api/clients'),
      fetch('/api/prospects'),
    ]);

    if (!agentsResponse.ok || !clientsResponse.ok || !prospectsResponse.ok) {
      throw new Error('Failed to fetch Obsidian data');
    }

    const agents = await agentsResponse.json();
    const clients = await clientsResponse.json();
    const prospects = await prospectsResponse.json();

    return {
      agents: agents.map((a: any) => ({
        name: a.name,
        status: a.status || 'idle',
        lastSync: a.last_activity || new Date().toISOString(),
        tasksCount: a.task_count || 0,
      })),
      clients: clients.map((c: any) => ({
        name: c.name,
        status: c.status || 'prospect',
        revenue: c.mrr || 0,
        dealStage: c.next_action,
      })),
      prospects: prospects.map((p: any) => ({
        name: p.name,
        status: p.stage || 'inquiry',
        revenue: p.deal_size || 0,
        dealStage: p.stage,
      })),
    };
  } catch (error) {
    console.error('Error fetching Obsidian data:', error);
    return { agents: [], clients: [], prospects: [] };
  }
}

export async function fetchAgentCount(): Promise<number> {
  try {
    const response = await fetch('/api/agents');
    if (!response.ok) return 0;
    const agents = await response.json();
    return agents.length;
  } catch (error) {
    console.error('Error fetching agent count:', error);
    return 0;
  }
}

export interface FormattedObsidianData {
  agentCount: number;
  activeAgents: number;
  clientCount: number;
  prospectCount: number;
}

export function formatObsidianDataForDisplay(data: ObsidianData): FormattedObsidianData {
  const activeAgents = data.agents.filter(a => a.status === 'active').length;
  return {
    agentCount: data.agents.length,
    activeAgents,
    clientCount: data.clients.length,
    prospectCount: data.prospects.length,
  };
}
