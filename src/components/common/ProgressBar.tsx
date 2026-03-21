import React from 'react';

export interface ProgressBarProps {
  value: number;
  color?: 'red' | 'yellow' | 'green';
  label?: string;
  animated?: boolean;
}

const colorStyles = {
  red: 'bg-primary shadow-[0_0_10px_#FF1744]',
  yellow: 'bg-metallic-gold shadow-[0_0_10px_#b5a67c]',
  green: 'bg-clinical-mint shadow-[0_0_10px_#9ee9d3]',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'red',
  label,
  animated = true,
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface/40">
            {label}
          </span>
          <span className="font-mono text-[9px] font-bold text-primary">
            {clamped}%
          </span>
        </div>
      )}
      <div className="h-0.5 bg-black w-full">
        <div
          className={`h-full ${colorStyles[color]} ${animated ? 'transition-all duration-500' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
