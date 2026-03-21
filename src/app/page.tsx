'use client';

import { useState } from 'react';
import { Core4Grid } from '@/components/core4';
import { DecisionGrid, Timeline } from '@/components/sections';
import { ErrorCard, CardSkeleton } from '@/components/common';
import { useCalendar } from '@/hooks/useCalendar';
import { useWHOOP } from '@/hooks/useWHOOP';
import { useTodoist } from '@/hooks/useTodoist';
import { useObsidian } from '@/hooks/useObsidian';
import { useCore4Data, useAgentStatusData, useRevenueData, useTimelineData } from '@/lib/mockData';
import type { Core4Metric, TimelineEvent } from '@/lib/mockData';

export default function CommandPage() {
  const calendarResult = useCalendar();
  const whoopResult = useWHOOP();
  const todoistResult = useTodoist();
  const obsidianResult = useObsidian();
  const core4Data = useCore4Data();
  const agentData = useAgentStatusData();
  const revenueData = useRevenueData();
  const timelineData = useTimelineData();
  const [selectedCore4, setSelectedCore4] = useState<Core4Metric | null>(null);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<TimelineEvent | null>(null);

  return (
    <div className="space-y-12">
      {/* CORE 4 STATUS BOXES */}
      <section>
        <Core4Grid data={core4Data} onCardClick={(metric) => setSelectedCore4(metric)} />
      </section>

      {/* DECISION GRID */}
      <section>
        {calendarResult.isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : calendarResult.isError ? (
          <ErrorCard title="Decision Grid Error" message={calendarResult.error?.message || 'Failed to load decisions'} onRetry={() => window.location.reload()} />
        ) : (
          <DecisionGrid
            calendarEvents={calendarResult.events.map((e) => ({ id: `${e.date}-${e.time}`, title: e.title, date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), time: e.time }))}
            agentStatuses={agentData}
            revenueData={revenueData}
          />
        )}
      </section>

      {/* OPERATIONAL HORIZON */}
      <section>
        <Timeline data={timelineData} onEventClick={(event) => setSelectedTimelineEvent(event)} />
      </section>

      {/* API STATUS */}
      <section className="bg-surface-0 border border-outline p-6">
        <h3 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          SYS_TELEMETRY
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Calendar', result: calendarResult },
            { label: 'WHOOP', result: whoopResult },
            { label: 'Todoist', result: todoistResult },
            { label: 'Obsidian', result: obsidianResult },
          ].map(({ label, result }) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`inline-block w-1.5 h-1.5 ${
                result.isFetching ? 'bg-metallic-gold animate-pulse' :
                result.isError ? 'bg-primary pip-glow' :
                'bg-clinical-mint clinical-glow'
              }`} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface/40">
                {label}
              </span>
              <span className={`font-mono text-[9px] uppercase tracking-widest ${
                result.isFetching ? 'text-metallic-gold' :
                result.isError ? 'text-primary' :
                'text-clinical-mint'
              }`}>
                {result.isFetching ? 'SYNC' : result.isError ? 'ERR' : 'LIVE'}
              </span>
            </div>
          ))}
        </div>
        {selectedCore4 && (
          <div className="mt-4 font-mono text-[9px] text-on-surface/30 uppercase tracking-widest">
            SELECTED: {selectedCore4.title}
          </div>
        )}
        {selectedTimelineEvent && (
          <div className="mt-2 font-mono text-[9px] text-on-surface/30 uppercase tracking-widest">
            EVENT: {selectedTimelineEvent.title}
          </div>
        )}
      </section>
    </div>
  );
}
