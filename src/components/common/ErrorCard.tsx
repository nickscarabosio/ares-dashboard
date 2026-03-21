import React from 'react';
import { Button } from './Button';

export interface ErrorCardProps {
  title?: string;
  message: string;
  errorCode?: string;
  onRetry?: () => void;
  onReauth?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = 'Error',
  message,
  errorCode,
  onRetry,
  onReauth,
}) => {
  const is401 = message.includes('Unauthorized') || message.includes('token');
  const is429 = message.includes('Rate limited');
  const isNetwork = message.includes('Network') || message.includes('offline');

  return (
    <div role="alert" className="bg-surface-0 border border-primary/30 p-6">
      <div className="border-l-2 border-primary pl-4">
        <h3 className="font-headline font-bold uppercase tracking-widest text-xs text-primary mb-2">
          {title}
        </h3>
        <p className="font-mono text-[11px] text-on-surface/60 uppercase tracking-wide">
          {message}
        </p>

        {errorCode && (
          <p className="font-mono text-[9px] text-on-surface/30 mt-2 tracking-widest">
            ERROR_CODE: {errorCode}
          </p>
        )}

        <div className="flex gap-2 mt-4">
          {is401 && onReauth && (
            <Button variant="secondary" size="sm" onClick={onReauth}>
              Reconnect
            </Button>
          )}
          {is429 && (
            <p className="font-mono text-[9px] text-metallic-gold uppercase tracking-widest animate-pulse">
              RETRYING IN 60S...
            </p>
          )}
          {(isNetwork || onRetry) && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const InlineError: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest">
    <span>{message}</span>
  </div>
);

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorCard
            title="Component Error"
            message={this.state.error?.message || 'Something went wrong'}
          />
        )
      );
    }
    return this.props.children;
  }
}
