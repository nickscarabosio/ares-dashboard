import React from 'react';

export interface StatusPipProps {
  status: 'active' | 'idle' | 'offline';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusColors = {
  active: 'bg-clinical-mint clinical-glow',
  idle: 'bg-metallic-gold',
  offline: 'bg-primary pip-glow',
};

const sizeStyles = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
};

export const StatusPip: React.FC<StatusPipProps> = ({
  status = 'idle',
  pulse = true,
  size = 'md',
}) => {
  return (
    <span
      className={`inline-block ${sizeStyles[size]} ${statusColors[status]} ${
        pulse && status === 'active' ? 'animate-pulse' : ''
      }`}
      title={`Status: ${status}`}
    />
  );
};

StatusPip.displayName = 'StatusPip';
