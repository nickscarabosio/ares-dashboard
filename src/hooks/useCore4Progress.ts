'use client';

import { useWHOOP } from '@/hooks/useWHOOP';
import type { TargetMetric } from '@/hooks/useTargets';

export type Core4Status = 'good' | 'at-risk' | 'critical';

export interface Core4ProgressDetail {
  label: string;
  value: string;
}

export interface Core4ProgressResult {
  value: string | number;
  valueLabel: string;
  unit: string;
  progress: number;
  status: Core4Status;
  statusLabel: 'Good' | 'At Risk' | 'Critical';
  color: 'green' | 'yellow' | 'red';
  details: Core4ProgressDetail[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

function parseNumericValue(rawValue: string | null | undefined): number | null {
  if (!rawValue) {
    return null;
  }

  const normalized = rawValue.trim().replace(/,/g, '').replace(/\$/g, '').toLowerCase();
  const match = normalized.match(/(-?\d*\.?\d+)\s*([kmb])?/);
  if (!match) {
    return null;
  }

  const parsedValue = Number.parseFloat(match[1]);
  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  const multiplierMap: Record<string, number> = {
    k: 1_000,
    m: 1_000_000,
    b: 1_000_000_000,
  };

  const multiplier = match[2] ? multiplierMap[match[2]] ?? 1 : 1;
  return parsedValue * multiplier;
}

function calculateProgress(current: number | null, target: number | null): number {
  if (current === null || !target || target <= 0) {
    return 0;
  }

  return Math.max(0, Math.round((current / target) * 100));
}

function resolveStatus(progress: number): Pick<Core4ProgressResult, 'status' | 'statusLabel' | 'color'> {
  if (progress >= 70) {
    return { status: 'good', statusLabel: 'Good', color: 'green' };
  }

  if (progress >= 40) {
    return { status: 'at-risk', statusLabel: 'At Risk', color: 'yellow' };
  }

  return { status: 'critical', statusLabel: 'Critical', color: 'red' };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000 ? 1 : 0,
  }).format(value);
}

export function useCore4Progress(
  metric: TargetMetric,
  target: string | null,
  currentValue?: string | null,
  bodyweight?: string
): Core4ProgressResult {
  const whoop = useWHOOP();
  const numericTarget = parseNumericValue(target);

  if (metric === 'fitness') {
    const liveStrain = Number.parseFloat(whoop.strain);
    const resolvedStrain = Number.isFinite(liveStrain) ? liveStrain : null;
    const progress = calculateProgress(resolvedStrain, numericTarget);
    const status = resolveStatus(progress);

    return {
      value: resolvedStrain ?? 0,
      valueLabel: whoop.isLoading ? '—' : whoop.strain,
      unit: 'strain',
      progress,
      ...status,
      details: [
        { label: 'Recovery', value: whoop.isLoading ? 'Loading' : whoop.recovery },
        { label: 'Sleep', value: whoop.isLoading ? 'Loading' : whoop.sleep },
        { label: 'Bodyweight', value: bodyweight ? `${bodyweight} lb` : 'Set bodyweight' },
      ],
      isLoading: whoop.isLoading,
      isError: whoop.isError,
      error: whoop.error,
    };
  }

  const numericCurrentValue = parseNumericValue(currentValue);
  const progress = calculateProgress(numericCurrentValue, numericTarget);
  const status = resolveStatus(progress);
  const isFinance = metric === 'finance';
  const formattedCurrentValue =
    numericCurrentValue === null
      ? '—'
      : isFinance
        ? formatCurrency(numericCurrentValue)
        : String(numericCurrentValue);
  const unit = metric === 'flow' ? 'points' : metric === 'family' ? 'moments' : '';

  return {
    value: numericCurrentValue ?? '—',
    valueLabel: formattedCurrentValue,
    unit,
    progress,
    ...status,
    details: [
      { label: 'Current', value: currentValue?.trim() || 'Set current value' },
      { label: 'Target', value: target?.trim() || 'Set target' },
      { label: 'Progress', value: `${progress}%` },
    ],
    isLoading: false,
    isError: false,
    error: null,
  };
}
