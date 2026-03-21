'use client';

import { useState } from 'react';
import { useCore4Data } from '@/lib/mockData';
import { useGoals } from '@/hooks/useGoals';
import { useWHOOP } from '@/hooks/useWHOOP';
import { Core4Grid } from '@/components/core4/Core4Grid';

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
  const core4Data = useCore4Data();
  const [, setSelectedMetric] = useState<string | null>(null);

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
        <Core4Grid data={core4Data} onCardClick={(m) => setSelectedMetric(m.title)} />
      </section>

      <section>
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          WHOOP_TELEMETRY
        </h2>
        <WHOOPPanel />
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
