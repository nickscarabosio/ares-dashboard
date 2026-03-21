'use client';

import { Card } from '@/components/common';
import type { AgentActivityItem } from '@/hooks/useAgentStatus';

interface ActivityFeedProps {
  items: AgentActivityItem[];
}

const statusMap: Record<AgentActivityItem['status'], { icon: string; className: string; label: string }> = {
  success: { icon: 'OK', className: 'text-clinical-mint', label: 'Success' },
  warning: { icon: 'WARN', className: 'text-metallic-gold', label: 'Warning' },
  error: { icon: 'ERR', className: 'text-primary', label: 'Error' },
  running: { icon: 'RUN', className: 'text-on-surface-bright', label: 'Running' },
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card className="p-0">
      <div className="border-b border-outline bg-black/30 px-6 py-5">
        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-primary">
          Activity Feed
        </div>
        <p className="mt-2 text-[11px] leading-5 text-on-surface/55">
          Recent agent jobs, completions, warnings, and errors from the last 24 hours.
        </p>
      </div>

      <div className="divide-y divide-outline">
        {items.length === 0 ? (
          <div className="px-6 py-8 text-center text-[11px] uppercase tracking-[0.2em] text-on-surface/30">
            No recent activity
          </div>
        ) : (
          items.map((item, index) => {
            const status = statusMap[item.status];

            return (
              <div key={`${item.agent}-${item.job}-${item.time}-${index}`} className="grid gap-3 px-6 py-4 md:grid-cols-[120px_1fr_140px] md:items-center">
                <div className={`font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${status.className}`}>
                  {status.icon}
                </div>
                <div className="text-[12px] leading-5 text-on-surface/80">
                  <span className="font-headline font-bold uppercase tracking-[0.08em] text-on-surface-bright">
                    {item.agent}
                  </span>{' '}
                  {item.job}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-on-surface/40 md:text-right">
                  {formatTimestamp(item.time)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
