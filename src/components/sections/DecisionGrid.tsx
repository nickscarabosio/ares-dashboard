import React from 'react';
import type {
  CalendarEvent,
  AgentStatus,
  RevenueSnapshot,
} from '@/lib/mockData';

export interface DecisionGridProps {
  calendarEvents?: CalendarEvent[];
  agentStatuses?: AgentStatus[];
  revenueData?: RevenueSnapshot[];
}

export const DecisionGrid: React.FC<DecisionGridProps> = ({
  calendarEvents = [],
  agentStatuses = [],
  revenueData = [],
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Column 1: TACTICAL_LOG */}
      <div className="space-y-6">
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60">
          TACTICAL_LOG
        </h2>
        <div className="space-y-2">
          {calendarEvents.map((event, i) => {
            const colors = [
              { time: 'text-clinical-mint', border: '', text: '' },
              { time: 'text-on-surface/40', border: 'border-l-4 border-l-on-surface/20', text: 'text-on-surface/50' },
              { time: 'text-metallic-gold', border: 'border-l-4 border-l-metallic-gold', text: 'text-metallic-gold' },
              { time: 'text-clinical-mint', border: 'border-l-4 border-l-clinical-mint', text: 'text-clinical-mint' },
            ];
            const style = colors[i % colors.length];
            return (
              <div
                key={event.id}
                className={`bg-surface-0 p-4 border border-outline flex items-center gap-6 group hover:border-clinical-mint/30 ${style.border}`}
              >
                <span className={`font-mono text-[10px] font-bold ${style.time}`}>
                  {event.time}
                </span>
                <span className={`font-mono font-bold text-[11px] uppercase tracking-widest ${style.text}`}>
                  {event.title.toUpperCase().replace(/\s+/g, '_')}
                </span>
              </div>
            );
          })}
          {calendarEvents.length === 0 && (
            <div className="text-on-surface/20 font-mono text-[10px] uppercase tracking-widest">
              NO_EVENTS_SCHEDULED
            </div>
          )}
        </div>
      </div>

      {/* Column 2: AGENT_MONITOR */}
      <div className="space-y-6">
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60">
          AGENT_MONITOR
        </h2>
        <div className="bg-surface-0 border border-outline">
          <table className="w-full text-left font-mono text-[10px]">
            <thead>
              <tr className="bg-black/40 border-b border-outline">
                <th className="p-4 uppercase tracking-[0.2em] text-on-surface/30">UNIT</th>
                <th className="p-4 uppercase tracking-[0.2em] text-on-surface/30 text-center">STATUS</th>
                <th className="p-4 uppercase tracking-[0.2em] text-on-surface/30 text-right">L_PULSE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {agentStatuses.map((agent) => {
                const isOffline = agent.status === 'offline';
                const statusColor = agent.status === 'active'
                  ? 'bg-clinical-mint clinical-glow'
                  : agent.status === 'idle'
                  ? 'bg-metallic-gold'
                  : 'bg-primary pip-glow';

                return (
                  <tr key={agent.name} className="hover:bg-primary/5 transition-colors">
                    <td className={`p-4 font-bold tracking-widest ${isOffline ? 'text-primary' : ''}`}>
                      {agent.name.toUpperCase()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block w-1.5 h-1.5 ${statusColor}`} />
                    </td>
                    <td className={`p-4 text-right ${isOffline ? 'text-primary/60' : 'text-on-surface/40'}`}>
                      {agent.status === 'offline' ? 'OFFLINE' : agent.lastSeen}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {agentStatuses.length === 0 && (
            <div className="p-4 text-on-surface/20 font-mono text-[10px] uppercase tracking-widest">
              NO_AGENTS_DEPLOYED
            </div>
          )}
        </div>
      </div>

      {/* Column 3: VAL_TELEMETRY */}
      <div className="space-y-6">
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60">
          VAL_TELEMETRY
        </h2>
        <div className="bg-surface-0 p-6 border border-outline space-y-8">
          {revenueData.map((item, idx) => {
            const isGreen = item.label.toLowerCase().includes('runway');
            return (
              <div key={idx}>
                <p className="uppercase tracking-[0.25em] text-[9px] text-on-surface/30 mb-2">
                  {item.label.toUpperCase().replace(/\s+/g, '_')}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-bold tracking-tighter ${isGreen ? 'text-clinical-mint' : 'text-primary'}`}>
                    {item.amount}
                  </p>
                  {item.trend && (
                    <span className={`uppercase tracking-[0.2em] text-[9px] ${isGreen ? 'text-clinical-mint/40' : 'text-on-surface/20'}`}>
                      {item.trend}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {revenueData.length === 0 && (
            <div className="text-on-surface/20 font-mono text-[10px] uppercase tracking-widest">
              NO_DATA
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

DecisionGrid.displayName = 'DecisionGrid';
