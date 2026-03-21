import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles = {
  primary:
    'bg-primary text-black font-headline font-black uppercase tracking-[0.2em] hover:shadow-[0_0_25px_rgba(255,23,68,0.7)] active:translate-y-px transition-all',
  secondary:
    'bg-transparent border border-primary/30 text-primary font-headline font-bold uppercase tracking-[0.2em] hover:bg-primary/10 transition-all',
  icon:
    'bg-transparent text-on-surface/40 hover:text-primary transition-colors p-2',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-[9px]',
  md: 'px-6 py-3 text-[10px]',
  lg: 'px-8 py-4 text-xs',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${variantStyles[variant]} ${variant !== 'icon' ? sizeStyles[size] : ''} disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
