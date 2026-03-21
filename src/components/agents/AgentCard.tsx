'use client';

import { Card, ProgressBar, StatusPip } from '@/components/common';
import type { AgentStatus } from '@/hooks/useAgentStatus';

interface AgentCardProps {
  agent: AgentStatus;
  isSelected: boolean;
  onSelect: (agent: AgentStatus) => void;
}

const statusLabelClasses: Record<AgentStatus['status'], string> = {
  active: 'text-clinical-mint',
  idle: 'text-metallic-gold',
  error: 'text-primary',
  sleeping: 'text-on-surface/45',
};

function statusToPip(status: AgentStatus['status']): 'active' | 'idle' | 'offline' {
  return status === 'error' ? 'offline' : status === 'active' ? 'active' : 'idle';
}

export function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  const progressColor = agent.status === 'error'
    ? 'red'
    : agent.status === 'active'
    ? 'green'
    : 'yellow';

  return (
    <Card
      clickable
      selected={isSelected}
      className="h-full p-5"
      onClick={() => onSelect(agent)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(agent);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Open ${agent.name} details`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-headline text-lg font-black uppercase tracking-[0.12em] text-on-surface-bright">
            {agent.name}
          </div>
          <div className="mt-1 text-[11px] font-mono uppercase tracking-[0.18em] text-on-surface/45">
            {agent.role}
          </div>
        </div>
        <StatusPip status={statusToPip(agent.status)} size="lg" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="border border-outline/80 bg-background px-3 py-2">
          <div className="text-[9px] uppercase tracking-[0.18em] text-on-surface/35">Status</div>
          <div className={`mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] ${statusLabelClasses[agent.status]}`}>
            {agent.status}
          </div>
        </div>
        <div className="border border-outline/80 bg-background px-3 py-2">
          <div className="text-[9px] uppercase tracking-[0.18em] text-on-surface/35">Last Activity</div>
          <div className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface">
            {agent.lastActivityLabel}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 text-[9px] uppercase tracking-[0.18em] text-on-surface/35">Current Job</div>
          <p className="text-[12px] leading-5 text-on-surface/75">
            {agent.currentJob}
          </p>
        </div>

        <ProgressBar value={agent.progress} color={progressColor} label="Task Progress" />

        <div className="grid grid-cols-2 gap-3 text-[10px] uppercase tracking-[0.16em]">
          <div className="border border-outline/80 bg-background px-3 py-2">
            <div className="text-on-surface/35">Last Deployed</div>
            <div className="mt-2 font-mono font-bold text-on-surface">{agent.lastDeployedLabel}</div>
          </div>
          <div className="border border-outline/80 bg-background px-3 py-2">
            <div className="text-on-surface/35">Progress</div>
            <div className="mt-2 font-mono font-bold text-on-surface">{agent.progress}%</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
