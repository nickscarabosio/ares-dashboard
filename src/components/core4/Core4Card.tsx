import React from 'react';

export interface Core4CardDetail {
  label: string;
  value: string;
}

export interface Core4CardProps {
  title: 'Fitness' | 'Flow' | 'Family' | 'Finance';
  value: string | number;
  unit: string;
  progress: number;
  color?: 'red' | 'yellow' | 'green';
  statusLabel?: string;
  index?: number;
  showTarget?: boolean;
  target?: string | null;
  details?: Core4CardDetail[];
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
  statusLabel,
  showTarget = true,
  target,
  details = [],
  onClick,
}) => {
  const idx = INDEX_MAP[title] || '00';
  const clampedProgress = Math.max(0, Math.min(progress, 100));
  const progressLabel = `${Math.max(0, Math.round(progress))}%`;
  const tone =
    color === 'green'
      ? {
          valueColor: 'text-clinical-mint',
          pipColor: 'bg-clinical-mint clinical-glow',
          progressColor: 'bg-clinical-mint shadow-[0_0_10px_#9ee9d3]',
          statusColor: 'text-clinical-mint',
        }
      : color === 'yellow'
        ? {
            valueColor: 'text-metallic-gold',
            pipColor: 'bg-metallic-gold shadow-[0_0_10px_rgba(230,188,92,0.8)]',
            progressColor: 'bg-metallic-gold shadow-[0_0_10px_rgba(230,188,92,0.8)]',
            statusColor: 'text-metallic-gold',
          }
        : {
            valueColor: 'text-primary',
            pipColor: 'bg-primary pip-glow',
            progressColor: 'bg-primary shadow-[0_0_10px_#FF1744]',
            statusColor: 'text-primary',
          };

  return (
    <div
      className="bg-surface-0 p-6 border border-outline relative overflow-hidden group hover:border-primary transition-colors cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${value}${unit ? ` ${unit}` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-mono font-bold uppercase tracking-widest text-[10px] text-on-surface/50">
          {idx}
          {' // '}
          {title}
        </h3>
        <div className={`w-2 h-2 ${tone.pipColor}`} />
      </div>

      <div className="flex items-baseline gap-2">
        {typeof value === 'number' || !isNaN(Number(String(value).replace(/[^0-9.]/g, ''))) ? (
          <span className={`font-mono text-5xl font-bold ${tone.valueColor} ${color !== 'green' ? 'text-glow' : ''}`}>
            {value}
            {unit && <span className="text-xs text-on-surface/20 ml-1">{unit}</span>}
          </span>
        ) : (
          <>
            <span className={`font-mono text-4xl font-bold ${tone.valueColor} uppercase tracking-tighter`}>
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
          className={`h-full ${tone.progressColor}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface/30">
            Progress
          </span>
          <span className={`font-mono text-[10px] uppercase tracking-widest text-right ${tone.statusColor}`}>
            {progressLabel}
          </span>
        </div>

        {statusLabel && (
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface/30">
              Status
            </span>
            <span className={`font-mono text-[10px] uppercase tracking-widest text-right ${tone.statusColor}`}>
              {statusLabel}
            </span>
          </div>
        )}

        {details.length > 0 && (
          <div className="border-t border-outline/60 pt-3 space-y-2">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface/30">
                  {detail.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface/70 text-right">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {showTarget && (
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface/30">
              Target
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface/60 text-right">
              {target || 'Set target'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

Core4Card.displayName = 'Core4Card';
