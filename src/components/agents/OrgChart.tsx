'use client';

import { Card, StatusPip } from '@/components/common';
import type { AgentStatus } from '@/hooks/useAgentStatus';

interface OrgChartProps {
  agents: AgentStatus[];
}

function statusToPip(status: AgentStatus['status']): 'active' | 'idle' | 'offline' {
  return status === 'error' ? 'offline' : status === 'active' ? 'active' : 'idle';
}

export function OrgChart({ agents }: OrgChartProps) {
  const rootAgents = agents.filter((agent) => agent.reportsTo === null);
  const childAgents = agents.filter((agent) => agent.reportsTo !== null);

  return (
    <Card className="sticky top-24 overflow-hidden p-0">
      <div className="border-b border-outline bg-black/30 px-6 py-5">
        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-primary">
          Org Chart
        </div>
        <p className="mt-2 max-w-sm text-[11px] leading-5 text-on-surface/55">
          Command hierarchy, reporting lines, and live agent state.
        </p>
      </div>

      <div className="space-y-6 p-6">
        {rootAgents.map((root) => {
          const directReports = childAgents.filter((agent) => agent.reportsTo === root.id);

          return (
            <div key={root.id} className="space-y-4">
              <div className="rounded-sm border border-primary/30 bg-primary/6 p-4 shadow-[inset_0_0_24px_rgba(255,23,68,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-headline text-xl font-black uppercase tracking-[0.1em] text-on-surface-bright">
                      {root.name}
                    </div>
                    <div className="mt-1 text-[11px] font-mono uppercase tracking-[0.18em] text-primary">
                      {root.role}
                    </div>
                  </div>
                  <StatusPip status={statusToPip(root.status)} size="lg" />
                </div>
                <p className="mt-3 text-[11px] leading-5 text-on-surface/55">
                  {root.description}
                </p>
              </div>

              <div className="ml-3 border-l border-primary/20 pl-5">
                <div className="space-y-3">
                  {directReports.map((report) => {
                    const subReports = childAgents.filter((agent) => agent.reportsTo === report.id);

                    return (
                      <div key={report.id} className="space-y-3">
                        <div className="relative rounded-sm border border-outline bg-surface-1 px-4 py-3">
                          <span className="absolute -left-[21px] top-5 h-px w-4 bg-primary/30" />
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-headline text-sm font-bold uppercase tracking-[0.16em] text-on-surface-bright">
                                {report.name}
                              </div>
                              <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-on-surface/45">
                                {report.role}
                              </div>
                            </div>
                            <StatusPip status={statusToPip(report.status)} />
                          </div>
                        </div>

                        {subReports.length > 0 ? (
                          <div className="ml-4 border-l border-outline pl-4">
                            <div className="space-y-2">
                              {subReports.map((subReport) => (
                                <div key={subReport.id} className="relative rounded-sm border border-outline/70 bg-background px-3 py-2">
                                  <span className="absolute -left-[17px] top-4 h-px w-3 bg-outline" />
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface">
                                        {subReport.name}
                                      </div>
                                      <div className="mt-1 text-[9px] uppercase tracking-[0.16em] text-on-surface/35">
                                        {subReport.role}
                                      </div>
                                    </div>
                                    <StatusPip status={statusToPip(subReport.status)} size="sm" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
