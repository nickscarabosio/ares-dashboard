import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface/30 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-surface-0 border-0 border-b-2 border-outline text-on-surface font-mono text-sm px-4 py-3 focus:border-primary focus:outline-none focus:shadow-[0_2px_8px_rgba(255,23,68,0.3)] transition-all placeholder:text-on-surface/20 ${className}`}
          {...props}
        />
        {error && (
          <p role="alert" className="mt-2 text-primary text-[10px] font-mono uppercase tracking-widest">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
