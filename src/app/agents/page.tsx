'use client';

import { useState } from 'react';
import { OrgChart } from '@/components/agents/OrgChart';
import { AgentCard } from '@/components/agents/AgentCard';
import { ActivityFeed } from '@/components/agents/ActivityFeed';
import { useAgentStatus } from '@/hooks/useAgentStatus';

export default function AgentsPage() {
  const { agents: agentStatuses, activity } = useAgentStatus();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-surface-dark p-6">
      <div className="max-w-full">
        <h1 className="text-4xl font-bold text-red-primary mb-8 font-display">AGENTS DASHBOARD</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Org Chart - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface-alt border border-red-primary/20 p-6">
              <h2 className="text-xl font-bold text-red-primary mb-4 font-display">ORG CHART</h2>
              <OrgChart agents={agentStatuses} />
            </div>
          </div>

          {/* Agent Cards Grid - Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentStatuses.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent === agent.id}
                  onSelect={(agent) => setSelectedAgent(agent.id)}
                />
              ))}
            </div>

            {/* Activity Feed - Bottom */}
            <div className="mt-8 bg-surface-alt border border-red-primary/20 p-6">
              <h2 className="text-xl font-bold text-red-primary mb-4 font-display">ACTIVITY FEED</h2>
              <ActivityFeed items={activity} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
