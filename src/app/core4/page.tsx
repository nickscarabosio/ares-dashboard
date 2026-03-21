'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useCore4Progress } from '@/hooks/useCore4Progress';
import { useWHOOP } from '@/hooks/useWHOOP';
import { useTargets, type TargetMetric } from '@/hooks/useTargets';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Core4Grid } from '@/components/core4/Core4Grid';

const BODYWEIGHT_STORAGE_KEY = 'core4_bodyweight';
const BODYWEIGHT_STORAGE_EVENT = 'core4-bodyweight-change';
const CURRENT_VALUES_STORAGE_KEY = 'core4_current_values';
const CURRENT_VALUES_STORAGE_EVENT = 'core4-current-values-change';

type ManualMetric = Exclude<TargetMetric, 'fitness'>;

interface Core4CurrentValues {
  flow: string | null;
  family: string | null;
  finance: string | null;
}

const DEFAULT_CURRENT_VALUES: Core4CurrentValues = {
  flow: null,
  family: null,
  finance: null,
};

function parseCurrentValues(value: string | null): Core4CurrentValues {
  if (!value) {
    return { ...DEFAULT_CURRENT_VALUES };
  }

  try {
    const parsed = JSON.parse(value) as Partial<Core4CurrentValues>;
    return {
      flow: parsed.flow ?? null,
      family: parsed.family ?? null,
      finance: parsed.finance ?? null,
    };
  } catch {
    return { ...DEFAULT_CURRENT_VALUES };
  }
}

function useBodyweight() {
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    const handleStorage = (event: Event) => {
      if (event instanceof StorageEvent && event.key && event.key !== BODYWEIGHT_STORAGE_KEY) {
        return;
      }

      callback();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(BODYWEIGHT_STORAGE_EVENT, handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(BODYWEIGHT_STORAGE_EVENT, handleStorage);
    };
  };

  const bodyweight = useSyncExternalStore(
    subscribe,
    () => (typeof window === 'undefined' ? '' : window.localStorage.getItem(BODYWEIGHT_STORAGE_KEY) ?? ''),
    () => ''
  );

  const saveBodyweight = (value: string) => {
    const nextValue = value.trim();

    if (nextValue) {
      window.localStorage.setItem(BODYWEIGHT_STORAGE_KEY, nextValue);
    } else {
      window.localStorage.removeItem(BODYWEIGHT_STORAGE_KEY);
    }

    window.dispatchEvent(new Event(BODYWEIGHT_STORAGE_EVENT));
  };

  const clearBodyweight = () => {
    window.localStorage.removeItem(BODYWEIGHT_STORAGE_KEY);
    window.dispatchEvent(new Event(BODYWEIGHT_STORAGE_EVENT));
  };

  return { bodyweight, saveBodyweight, clearBodyweight };
}

function useCurrentValues() {
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    const handleStorage = (event: Event) => {
      if (event instanceof StorageEvent && event.key && event.key !== CURRENT_VALUES_STORAGE_KEY) {
        return;
      }

      callback();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CURRENT_VALUES_STORAGE_EVENT, handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CURRENT_VALUES_STORAGE_EVENT, handleStorage);
    };
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_CURRENT_VALUES };
    }

    return parseCurrentValues(window.localStorage.getItem(CURRENT_VALUES_STORAGE_KEY));
  };

  const currentValues = useSyncExternalStore(subscribe, getSnapshot, () => ({ ...DEFAULT_CURRENT_VALUES }));

  const setCurrentValue = (metric: ManualMetric, value: string) => {
    const nextValue = value.trim();
    const nextValues = {
      ...currentValues,
      [metric]: nextValue || null,
    };

    window.localStorage.setItem(CURRENT_VALUES_STORAGE_KEY, JSON.stringify(nextValues));
    window.dispatchEvent(new Event(CURRENT_VALUES_STORAGE_EVENT));
  };

  const clearCurrentValue = (metric: ManualMetric) => {
    const nextValues = {
      ...currentValues,
      [metric]: null,
    };

    window.localStorage.setItem(CURRENT_VALUES_STORAGE_KEY, JSON.stringify(nextValues));
    window.dispatchEvent(new Event(CURRENT_VALUES_STORAGE_EVENT));
  };

  return { currentValues, setCurrentValue, clearCurrentValue };
}

const GoalsSection: React.FC = () => {
  const { currentSprint } = useGoals();

  if (!currentSprint) {
    return (
      <div className="bg-surface-0 border border-outline p-8 text-center">
        <p className="text-on-surface/20 font-mono text-[10px] uppercase tracking-widest mb-4">NO_ACTIVE_SPRINT</p>
        <button className="px-6 py-3 bg-primary text-black font-headline font-black text-[10px] uppercase tracking-[0.2em]">
          INITIALIZE_SPRINT
        </button>
      </div>
    );
  }

  const startDate = new Date(currentSprint.start_date);
  const endDate = new Date(currentSprint.end_date);
  const today = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const sprintProgress = Math.round(((totalDays - daysRemaining) / totalDays) * 100);

  const calculateProgress = (targets: { completed: number; target: number }[]) => {
    if (targets.length === 0) return 0;
    const completed = targets.reduce((sum, t) => sum + t.completed, 0);
    const total = targets.reduce((sum, t) => sum + t.target, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const categories = ['fitness', 'flow', 'family', 'finance'] as const;
  const categoryColors = {
    fitness: 'border-primary',
    flow: 'border-primary',
    family: 'border-clinical-mint',
    finance: 'border-metallic-gold',
  };

  return (
    <div className="space-y-6">
      {/* Sprint Header */}
      <div className="bg-surface-0 border border-outline p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
          <div>
            <h3 className="font-headline font-bold uppercase tracking-widest text-xs text-on-surface mb-1">
              {currentSprint.name}
            </h3>
            <div className="font-mono text-[9px] text-on-surface/30 uppercase tracking-widest">
              {startDate.toLocaleDateString()} — {endDate.toLocaleDateString()}
            </div>
          </div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <div className="text-right">
              <div className="text-[8px] uppercase font-mono text-on-surface/30 tracking-widest">DAYS_REM</div>
              <div className="font-mono text-lg font-bold text-primary">{daysRemaining}</div>
            </div>
            <div className="text-right">
              <div className="text-[8px] uppercase font-mono text-on-surface/30 tracking-widest">PROGRESS</div>
              <div className="font-mono text-lg font-bold text-clinical-mint">{sprintProgress}%</div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-black w-full">
          <div className="h-full bg-primary shadow-[0_0_10px_#FF1744]" style={{ width: `${sprintProgress}%` }} />
        </div>
      </div>

      {/* Category Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(category => {
          const targets = currentSprint.targets[category];
          if (targets.length === 0) return null;
          const progress = calculateProgress(targets);

          return (
            <div key={category} className={`bg-surface-0 border border-outline border-l-2 ${categoryColors[category]} p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-headline font-bold uppercase tracking-widest text-[11px] text-on-surface">
                  {category}
                </h4>
                <span className="font-mono text-xs font-bold text-primary">{progress}%</span>
              </div>
              <div className="space-y-3">
                {targets.map(target => {
                  const targetProgress = target.target > 0 ? (target.completed / target.target) * 100 : 0;
                  return (
                    <div key={target.id} className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-on-surface/60 uppercase tracking-widest flex-1">
                        {target.name}
                      </span>
                      <span className="font-mono text-[10px] text-on-surface/40 mx-4">
                        {target.completed}/{target.target}
                      </span>
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-widest ${
                        targetProgress >= 100 ? 'text-clinical-mint' : 'text-primary'
                      }`}>
                        {targetProgress >= 100 ? 'DONE' : `${Math.round(targetProgress)}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WHOOPPanel: React.FC = () => {
  const whoop = useWHOOP();
  const metrics = [
    { label: 'Sleep', value: whoop.sleep, color: 'text-clinical-mint' },
    { label: 'Strain', value: whoop.strain, color: 'text-primary' },
    { label: 'Recovery', value: whoop.recovery, color: 'text-clinical-mint' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map(m => (
        <div key={m.label} className="bg-surface-0 p-6 border border-outline">
          <div className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest mb-3">
            {m.label.toUpperCase()}_INDEX
          </div>
          <div className={`font-mono text-4xl font-bold ${m.color} tracking-tighter`}>
            {whoop.isLoading ? '—' : m.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Core4Page() {
  const { targets, setTarget, clearTarget } = useTargets();
  const { bodyweight, saveBodyweight, clearBodyweight } = useBodyweight();
  const { currentValues, setCurrentValue, clearCurrentValue } = useCurrentValues();
  const [, setSelectedMetric] = useState<string | null>(null);
  const [draftTargets, setDraftTargets] = useState<Record<TargetMetric, string>>({
    fitness: '',
    flow: '',
    family: '',
    finance: '',
  });
  const [draftCurrentValues, setDraftCurrentValues] = useState<Record<ManualMetric, string>>({
    flow: '',
    family: '',
    finance: '',
  });
  const [bodyweightDraft, setBodyweightDraft] = useState('');

  useEffect(() => {
    setDraftTargets({
      fitness: targets.fitness ?? '',
      flow: targets.flow ?? '',
      family: targets.family ?? '',
      finance: targets.finance ?? '',
    });
  }, [targets]);

  useEffect(() => {
    setBodyweightDraft(bodyweight);
  }, [bodyweight]);

  useEffect(() => {
    setDraftCurrentValues({
      flow: currentValues.flow ?? '',
      family: currentValues.family ?? '',
      finance: currentValues.finance ?? '',
    });
  }, [currentValues]);

  const fitnessProgress = useCore4Progress('fitness', targets.fitness, undefined, bodyweight);
  const flowProgress = useCore4Progress('flow', targets.flow, currentValues.flow);
  const familyProgress = useCore4Progress('family', targets.family, currentValues.family);
  const financeProgress = useCore4Progress('finance', targets.finance, currentValues.finance);

  const enhancedCore4Data = [
    {
      title: 'Fitness' as const,
      value: fitnessProgress.valueLabel,
      unit: fitnessProgress.unit,
      progress: fitnessProgress.progress,
      status: (fitnessProgress.statusLabel === 'Good' ? 'active' : fitnessProgress.statusLabel === 'At Risk' ? 'idle' : 'offline') as 'active' | 'idle' | 'offline',
      color: fitnessProgress.color,
      target: targets.fitness,
      details: fitnessProgress.details,
    },
    {
      title: 'Flow' as const,
      value: flowProgress.valueLabel,
      unit: flowProgress.unit,
      progress: flowProgress.progress,
      status: (flowProgress.statusLabel === 'Good' ? 'active' : flowProgress.statusLabel === 'At Risk' ? 'idle' : 'offline') as 'active' | 'idle' | 'offline',
      color: flowProgress.color,
      target: targets.flow,
      details: flowProgress.details,
    },
    {
      title: 'Family' as const,
      value: familyProgress.valueLabel,
      unit: familyProgress.unit,
      progress: familyProgress.progress,
      status: (familyProgress.statusLabel === 'Good' ? 'active' : familyProgress.statusLabel === 'At Risk' ? 'idle' : 'offline') as 'active' | 'idle' | 'offline',
      color: familyProgress.color,
      target: targets.family,
      details: familyProgress.details,
    },
    {
      title: 'Finance' as const,
      value: financeProgress.valueLabel,
      unit: financeProgress.unit,
      progress: financeProgress.progress,
      status: (financeProgress.statusLabel === 'Good' ? 'active' : financeProgress.statusLabel === 'At Risk' ? 'idle' : 'offline') as 'active' | 'idle' | 'offline',
      color: financeProgress.color,
      target: targets.finance,
      details: financeProgress.details,
    },
  ];

  const targetFields: Array<{
    metric: TargetMetric;
    label: string;
    placeholder: string;
  }> = [
    { metric: 'fitness', label: 'Set 90-day Fitness target', placeholder: '7.5 daily strain' },
    { metric: 'flow', label: 'Flow target', placeholder: '50 Flow tasks' },
    { metric: 'family', label: 'Family target', placeholder: '3x family dinners/week' },
    { metric: 'finance', label: 'Finance target', placeholder: '$500K ARR' },
  ];

  const currentValueFields: Array<{
    metric: ManualMetric;
    label: string;
    placeholder: string;
  }> = [
    { metric: 'flow', label: 'Flow current value', placeholder: '35' },
    { metric: 'family', label: 'Family current value', placeholder: '8' },
    { metric: 'finance', label: 'Finance current value', placeholder: '$125000' },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-headline text-5xl font-black uppercase tracking-[0.05em] text-on-surface-bright mb-2">
          CORE <span className="text-primary drop-shadow-[0_0_8px_rgba(255,23,68,0.4)]">4</span>
        </h1>
        <p className="text-on-surface/40 font-mono text-[10px] uppercase tracking-[0.3em]">
          VITAL_METRICS // <span className="text-clinical-mint">DEEP_SCAN_MODE</span>
        </p>
      </div>

      <section>
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          VITAL_METRICS
        </h2>
        <Core4Grid
          data={enhancedCore4Data}
          onCardClick={(m) => setSelectedMetric(m.title)}
        />
      </section>

      <section>
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          WHOOP_TELEMETRY
        </h2>
        <WHOOPPanel />
      </section>

      <section>
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          SET_TARGETS
        </h2>
        <div className="bg-surface-0 border border-outline p-6 space-y-8">
          <div className="space-y-4">
            <div>
              <h3 className="font-headline font-bold uppercase tracking-widest text-xs text-on-surface mb-1">
                Fitness Input
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface/30">
                Save daily bodyweight for the Fitness card.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-3 items-end">
              <Input
                label="Bodyweight"
                placeholder="198.4"
                value={bodyweightDraft}
                onChange={(e) => setBodyweightDraft(e.target.value)}
              />
              <Button type="button" onClick={() => saveBodyweight(bodyweightDraft)}>
                Save
              </Button>
              <Button type="button" variant="secondary" onClick={() => {
                setBodyweightDraft('');
                clearBodyweight();
              }}>
                Clear
              </Button>
            </div>
          </div>

          <div className="border-t border-outline pt-6 space-y-6">
            <div>
              <h3 className="font-headline font-bold uppercase tracking-widest text-xs text-on-surface mb-1">
                90 Day Targets
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface/30">
                Set 90-day targets and persist them locally. Fitness stays on WHOOP, the other three are manual.
              </p>
            </div>

            {targetFields.map((field) => (
              <div key={field.metric} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-3 items-end">
                <Input
                  label={field.label}
                  placeholder={field.placeholder}
                  value={draftTargets[field.metric]}
                  onChange={(e) => setDraftTargets((current) => ({
                    ...current,
                    [field.metric]: e.target.value,
                  }))}
                />
                <Button type="button" onClick={() => {
                  const nextValue = draftTargets[field.metric].trim();
                  setDraftTargets((current) => ({
                    ...current,
                    [field.metric]: nextValue,
                  }));
                  setTarget(field.metric, nextValue);
                }}>
                  Save
                </Button>
                <Button type="button" variant="secondary" onClick={() => {
                  setDraftTargets((current) => ({
                    ...current,
                    [field.metric]: '',
                  }));
                  clearTarget(field.metric);
                }}>
                  Clear
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t border-outline pt-6 space-y-6">
            <div>
              <h3 className="font-headline font-bold uppercase tracking-widest text-xs text-on-surface mb-1">
                Current Values
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface/30">
                Manual tracking for Flow, Family, and Finance. Progress is current divided by target, stored in local browser state.
              </p>
            </div>

            {currentValueFields.map((field) => (
              <div key={field.metric} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-3 items-end">
                <Input
                  label={field.label}
                  placeholder={field.placeholder}
                  value={draftCurrentValues[field.metric]}
                  onChange={(e) => setDraftCurrentValues((current) => ({
                    ...current,
                    [field.metric]: e.target.value,
                  }))}
                />
                <Button type="button" onClick={() => {
                  const nextValue = draftCurrentValues[field.metric].trim();
                  setDraftCurrentValues((current) => ({
                    ...current,
                    [field.metric]: nextValue,
                  }));
                  setCurrentValue(field.metric, nextValue);
                }}>
                  Save
                </Button>
                <Button type="button" variant="secondary" onClick={() => {
                  setDraftCurrentValues((current) => ({
                    ...current,
                    [field.metric]: '',
                  }));
                  clearCurrentValue(field.metric);
                }}>
                  Clear
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          90_DAY_SPRINT
        </h2>
        <GoalsSection />
      </section>
    </div>
  );
}
