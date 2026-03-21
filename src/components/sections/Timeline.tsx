import React from 'react';
import type { TimelineEvent } from '@/lib/mockData';

export interface TimelineProps {
  data?: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

const getStatusLabel = (type: 'overdue' | 'warning' | 'stable') => {
  switch (type) {
    case 'overdue': return 'OVERDUE // CRITICAL';
    case 'warning': return 'WARNING // PENDING';
    case 'stable': return 'STABLE // MILESTONE';
  }
};

const getStatusColor = (type: 'overdue' | 'warning' | 'stable') => {
  switch (type) {
    case 'overdue': return {
      border: 'border-l-primary',
      label: 'text-primary',
      hover: 'hover:bg-primary/5',
    };
    case 'warning': return {
      border: 'border-l-metallic-gold',
      label: 'text-metallic-gold',
      hover: '',
    };
    case 'stable': return {
      border: 'border-l-on-surface/20',
      label: 'text-on-surface/30',
      hover: '',
    };
  }
};

export const Timeline: React.FC<TimelineProps> = ({ data = [], onEventClick }) => {
  return (
    <div className="space-y-6">
      <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60">
        HORIZON_SCAN (7D)
      </h2>

      <div className="flex overflow-x-auto pb-6 gap-6">
        {data.map((event) => {
          const colors = getStatusColor(event.type);
          return (
            <div
              key={event.id}
              className={`min-w-[280px] bg-surface-0 p-5 border-l-2 ${colors.border} border-t border-r border-b border-outline flex flex-col justify-between group ${colors.hover} transition-all cursor-pointer`}
              onClick={() => onEventClick?.(event)}
              role="button"
              tabIndex={0}
              aria-label={`${event.title}, ${getStatusLabel(event.type)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onEventClick?.(event);
                }
              }}
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[9px] uppercase tracking-[0.3em] font-bold ${colors.label}`}>
                    {getStatusLabel(event.type)}
                  </span>
                </div>

                <h4 className={`font-bold text-xs uppercase tracking-widest mb-1 ${event.type === 'overdue' ? 'text-glow' : ''}`}>
                  {event.title.toUpperCase().replace(/\s+/g, '_')}
                </h4>
                <p className="text-[9px] text-on-surface/40 uppercase tracking-widest">
                  {event.dayOfWeek || 'SYSTEM READY'}
                </p>
              </div>

              <p className={`mt-8 font-mono text-[9px] uppercase tracking-widest ${
                event.type === 'overdue' ? 'text-primary/60' : 'text-on-surface/30'
              }`}>
                {event.type === 'overdue' ? 'T-MINUS: 00:00' : event.date}
              </p>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="text-on-surface/20 font-mono text-[10px] uppercase tracking-widest">
            NO_EVENTS_HORIZON
          </div>
        )}
      </div>
    </div>
  );
};

Timeline.displayName = 'Timeline';
