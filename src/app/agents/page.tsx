'use client';

import { useState, useEffect } from 'react';
import { useAgentsData, type Agent } from '@/hooks/useAgentsData';
import { ErrorCard, CardSkeleton } from '@/components/common';

const AgentDetailPanel: React.FC<{ agent: Agent | null; onClose: () => void }> = ({ agent, onClose }) => {
  useEffect(() => {
    if (!agent) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [agent, onClose]);

  if (!agent) return null;
  const loadPercent = Math.min(agent.task_count * 20, 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-detail-title"
      className="fixed top-16 right-0 h-[calc(100vh-64px)] w-[400px] glass-hud border-l-2 border-primary/30 p-10 z-30 overflow-y-auto"
    >
      <div className="flex justify-between items-start mb-10">
        <div>
          <span className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] mb-2 font-bold block">
            UNIT_DOSSIER
          </span>
          <h2 id="agent-detail-title" className="font-headline text-3xl font-black uppercase tracking-tight text-on-surface-bright">
            {agent.name}
          </h2>
        </div>
        <button onClick={onClose} aria-label="Close agent detail panel" className="text-on-surface/30 hover:text-primary transition-colors text-2xl">
          &times;
        </button>
      </div>
      <div className="space-y-4">
        <div className="bg-background p-4">
          <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">STATUS</div>
          <div className={`text-[11px] font-black uppercase tracking-widest ${
            agent.status === 'active' ? 'text-clinical-mint' : agent.status === 'idle' ? 'text-metallic-gold' : 'text-primary'
          }`}>{agent.status.toUpperCase()}</div>
        </div>
        <div className="bg-background p-4">
          <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">TASK_QUEUE</div>
          <div className="text-[11px] font-bold text-on-surface uppercase tracking-widest">{agent.task_count} ACTIVE</div>
        </div>
        <div className="bg-background p-4">
          <div className="flex justify-between mb-3 items-end">
            <span className="text-[8px] uppercase font-mono text-on-surface/30 tracking-[0.2em]">LOAD_FACTOR</span>
            <span className="text-xs font-mono font-bold text-primary">{loadPercent}%</span>
          </div>
          <div className="relative w-full h-[6px] bg-on-surface/10">
            <div className="absolute left-0 top-0 h-full bg-primary shadow-[0_0_10px_#FF1744]" style={{ width: `${loadPercent}%` }} />
          </div>
        </div>
        {agent.last_activity && (
          <div className="bg-background p-4">
            <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">LAST_PULSE</div>
            <div className="text-[11px] text-on-surface/60 font-mono tracking-wide">
              {new Date(agent.last_activity).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-8 w-full py-4 bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_15px_rgba(255,23,68,0.4)]"
      >
        CLOSE_PANEL
      </button>
    </div>
  );
};

export default function AgentsPage() {
  const { agents, isLoading, isError, error } = useAgentsData();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const activeCount = agents.filter(a => a.status === 'active').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.task_count, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="font-headline text-5xl font-black uppercase tracking-[0.05em] text-on-surface-bright mb-2">
            AGENT <span className="text-primary drop-shadow-[0_0_8px_rgba(255,23,68,0.4)]">MONITOR</span>
          </h1>
          <p className="text-on-surface/40 font-mono text-[10px] uppercase tracking-[0.3em]">
            DEPLOYED_UNITS // <span className="text-clinical-mint">TELEMETRY_ACTIVE</span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-surface-high px-6 py-3 border border-on-surface/5 border-l-2 border-clinical-mint">
            <div className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest">ONLINE_UNITS</div>
            <div className="font-mono text-xl font-bold text-clinical-mint tracking-tighter">{activeCount}</div>
          </div>
          <div className="bg-surface-high px-6 py-3 border border-on-surface/5 border-l-2 border-primary">
            <div className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest">TOTAL_TASKS</div>
            <div className="font-mono text-xl font-bold text-primary tracking-tighter">{totalTasks}</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : isError ? (
        <ErrorCard title="Failed to Load Agents" message={error?.message || 'Could not fetch agent data'} onRetry={() => window.location.reload()} />
      ) : agents.length === 0 ? (
        <div className="bg-surface-0 border border-outline p-12 text-center">
          <p className="text-on-surface/20 font-mono text-[10px] uppercase tracking-widest">NO_UNITS_DEPLOYED</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const statusColor = agent.status === 'active'
              ? 'bg-clinical-mint clinical-glow'
              : agent.status === 'idle'
              ? 'bg-metallic-gold'
              : 'bg-primary pip-glow';
            const statusText = agent.status === 'active'
              ? 'text-clinical-mint'
              : agent.status === 'idle'
              ? 'text-metallic-gold'
              : 'text-primary';

            return (
              <div
                key={agent.name}
                className="bg-surface-0 p-6 border border-outline hover:border-primary/40 transition-all cursor-pointer group"
                onClick={() => setSelectedAgent(agent)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAgent(agent); } }}
                role="button"
                tabIndex={0}
                aria-label={`View details for agent ${agent.name}, ${agent.status}, ${agent.task_count} tasks`}
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-mono font-bold uppercase tracking-widest text-xs text-on-surface">
                    {agent.name.toUpperCase()}
                  </h3>
                  <span className={`inline-block w-2 h-2 ${statusColor}`} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest">STATUS</span>
                    <span className={`text-[9px] uppercase font-mono font-bold tracking-widest ${statusText}`}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest">TASKS</span>
                    <span className="text-[9px] uppercase font-mono font-bold text-on-surface tracking-widest">
                      {agent.task_count}
                    </span>
                  </div>
                  {agent.last_activity && (
                    <div className="flex justify-between">
                      <span className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest">L_PULSE</span>
                      <span className="text-[9px] font-mono text-on-surface/40 tracking-widest">
                        {new Date(agent.last_activity).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 h-0.5 bg-black w-full">
                  <div
                    className="h-full bg-primary shadow-[0_0_10px_#FF1744]"
                    style={{ width: `${Math.min(agent.task_count * 20, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AgentDetailPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
    </div>
  );
}
