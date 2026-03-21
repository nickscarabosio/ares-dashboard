import React from 'react';

export interface Core4CardProps {
  title: 'Fitness' | 'Flow' | 'Family' | 'Finance';
  value: string | number;
  unit: string;
  progress: number;
  status: 'active' | 'idle' | 'offline';
  color?: 'red' | 'yellow' | 'green';
  index?: number;
  onClick?: () => void;
}

const INDEX_MAP: Record<string, string> = {
  Fitness: '01',
  Flow: '02',
  Family: '03',
  Finance: '04',
};

export const Core4Card: React.FC<Core4CardProps> = ({
  title,
  value,
  unit,
  progress,
  color,
  onClick,
}) => {
  const idx = INDEX_MAP[title] || '00';
  const isMint = title === 'Family' || color === 'green';
  const valueColor = isMint ? 'text-clinical-mint' : 'text-primary';
  const pipColor = isMint ? 'bg-clinical-mint clinical-glow' : 'bg-primary pip-glow';

  return (
    <div
      className="bg-surface-0 p-6 border border-outline relative overflow-hidden group hover:border-primary transition-colors cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${value} ${unit}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-mono font-bold uppercase tracking-widest text-[10px] text-on-surface/50">
          {idx} // {title}
        </h3>
        <div className={`w-2 h-2 ${pipColor}`} />
      </div>

      <div className="flex items-baseline gap-2">
        {typeof value === 'number' || !isNaN(Number(String(value).replace(/[^0-9.]/g, ''))) ? (
          <span className={`font-mono text-5xl font-bold ${valueColor} ${!isMint ? 'text-glow' : ''}`}>
            {value}
            {unit && <span className="text-xs text-on-surface/20 ml-1">{unit}</span>}
          </span>
        ) : (
          <>
            <span className={`font-mono text-4xl font-bold ${valueColor} uppercase tracking-tighter`}>
              {value}
            </span>
            {unit && (
              <p className="font-mono text-[9px] text-on-surface/30 mt-6 tracking-widest uppercase">
                {unit}
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-6 h-0.5 bg-black w-full">
        <div
          className={`h-full ${isMint ? 'bg-clinical-mint shadow-[0_0_10px_#9ee9d3]' : 'bg-primary shadow-[0_0_10px_#FF1744]'}`}
          style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
        />
      </div>
    </div>
  );
};

Core4Card.displayName = 'Core4Card';
