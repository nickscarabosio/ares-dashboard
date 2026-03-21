'use client';

import { useState } from 'react';

export type TargetMetric = 'flow' | 'family' | 'finance';

export interface Core4Targets {
  flow: string | null;
  family: string | null;
  finance: string | null;
}

const TARGETS_STORAGE_KEY = 'core4_targets';

const DEFAULT_TARGETS: Core4Targets = {
  flow: null,
  family: null,
  finance: null,
};

function parseTargets(value: string | null): Core4Targets {
  if (!value) {
    return DEFAULT_TARGETS;
  }

  try {
    const parsed = JSON.parse(value) as Partial<Core4Targets>;
    return {
      flow: parsed.flow ?? null,
      family: parsed.family ?? null,
      finance: parsed.finance ?? null,
    };
  } catch {
    return DEFAULT_TARGETS;
  }
}

export function useTargets() {
  const [targets, setTargets] = useState<Core4Targets>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_TARGETS;
    }

    return parseTargets(window.localStorage.getItem(TARGETS_STORAGE_KEY));
  });

  const getTargets = () => targets;

  const setTarget = (metric: TargetMetric, value: string) => {
    const nextTargets = {
      ...targets,
      [metric]: value || null,
    };

    setTargets(nextTargets);
    window.localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(nextTargets));
  };

  const clearTarget = (metric: TargetMetric) => {
    const nextTargets = {
      ...targets,
      [metric]: null,
    };

    setTargets(nextTargets);
    window.localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(nextTargets));
  };

  return { targets, getTargets, setTarget, clearTarget };
}
