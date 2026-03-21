import React from 'react';
import { Core4Card, type Core4CardDetail } from './Core4Card';
import type { Core4Metric } from '@/lib/mockData';
import type { Core4Targets } from '@/hooks';

export interface Core4GridProps {
  data?: Core4Metric[];
  targets?: Core4Targets;
  fitnessDetails?: Core4CardDetail[];
  onCardClick?: (metric: Core4Metric) => void;
}

export const Core4Grid: React.FC<Core4GridProps> = ({ data, targets, fitnessDetails, onCardClick }) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((metric) => (
        <Core4Card
          key={metric.title}
          title={metric.title}
          value={metric.value}
          unit={metric.unit}
          progress={metric.progress}
          color={metric.color}
          showTarget
          target={targets?.[metric.title.toLowerCase() as keyof Core4Targets] ?? null}
          details={metric.title === 'Fitness' ? fitnessDetails : undefined}
          onClick={() => onCardClick?.(metric)}
        />
      ))}
    </div>
  );
};

Core4Grid.displayName = 'Core4Grid';
