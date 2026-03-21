import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  selected?: boolean;
  clickable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, children, selected = false, clickable = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-surface-0 p-6 border border-outline transition-colors ${
          selected ? 'border-primary ares-glow' : ''
        } ${
          clickable ? 'cursor-pointer hover:border-primary/40' : ''
        } ${className}`}
        {...props}
      >
        {title && (
          <h3 className="font-mono font-bold uppercase tracking-widest text-[10px] text-on-surface/50 mb-4">
            {title}
          </h3>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
