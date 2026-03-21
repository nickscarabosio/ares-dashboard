import React from 'react';
import { Core4Card } from './Core4Card';
import type { Core4Metric } from '@/lib/mockData';

export interface Core4GridProps {
  data?: Core4Metric[];
  onCardClick?: (metric: Core4Metric) => void;
}

export const Core4Grid: React.FC<Core4GridProps> = ({ data, onCardClick }) => {
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
          status={metric.status}
          color={metric.color}
          onClick={() => onCardClick?.(metric)}
        />
      ))}
    </div>
  );
};

Core4Grid.displayName = 'Core4Grid';
