import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle' | 'line';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height = '20px',
}) => {
  return (
    <div
      className={`bg-surface-3 animate-pulse ${variant === 'circle' ? 'rounded-full' : ''}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-surface-0 p-6 border border-outline space-y-4">
    <Skeleton variant="text" width="60%" height="16px" />
    <Skeleton variant="text" width="40%" height="32px" />
    <Skeleton variant="line" width="100%" height="4px" />
  </div>
);

export const GridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 bg-surface-0 p-4 border border-outline">
        <Skeleton variant="circle" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" height="16px" />
          <Skeleton variant="text" width="50%" height="12px" />
        </div>
      </div>
    ))}
  </div>
);
