'use client';

import { useState, useEffect } from 'react';
import { useCRMDeals } from '@/hooks/useCRMDeals';
import { ErrorCard, CardSkeleton } from '@/components/common';
import type { Deal } from '@/lib/api/crm';

const STAGES = ['Inquiry', 'Qualified', 'Proposal', 'Won'];

const DealDetailPanel: React.FC<{ deal: Deal | null; onClose: () => void }> = ({ deal, onClose }) => {
  useEffect(() => {
    if (!deal) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deal, onClose]);

  if (!deal) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deal-detail-title"
      className="fixed top-16 right-0 h-[calc(100vh-64px)] w-[400px] glass-hud border-l-2 border-primary/30 p-10 z-30 overflow-y-auto"
    >
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] mb-2 font-bold">
            DATA_ENTRY // INTEL-{deal.id?.slice(-4) || '0000'}
          </span>
          <h2 id="deal-detail-title" className="font-headline text-3xl font-black uppercase tracking-tight text-on-surface-bright leading-tight">
            {deal.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close deal detail panel"
          className="text-on-surface/30 hover:text-primary transition-colors text-2xl"
        >
          &times;
        </button>
      </div>

      {/* Metadata */}
      <div className="space-y-6 mb-10">
        <div className="grid grid-cols-2 gap-[2px] bg-on-surface/5">
          <div className="p-4 bg-background">
            <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">STAGE</div>
            <div className="text-[11px] font-black text-on-surface uppercase tracking-widest">{deal.stage}</div>
          </div>
          <div className="p-4 bg-background">
            <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">STATUS</div>
            <div className="text-[11px] font-black text-primary uppercase tracking-widest">{deal.status?.toUpperCase() || 'ACTIVE'}</div>
          </div>
        </div>

        <div className="bg-background p-4">
          <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">ASSET_VALUE</div>
          <div className="font-mono text-2xl font-bold text-primary tracking-tighter">${deal.value.toLocaleString()}</div>
        </div>

        {deal.company && (
          <div className="bg-background p-4">
            <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">ENTITY</div>
            <div className="text-[11px] font-bold text-on-surface uppercase tracking-widest">{deal.company}</div>
          </div>
        )}

        {deal.contact_email && (
          <div className="bg-background p-4">
            <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">CONTACT_NODE</div>
            <div className="text-[11px] text-on-surface/60 font-mono tracking-wide">{deal.contact_email}</div>
          </div>
        )}

        {deal.notes && (
          <div className="bg-background p-4">
            <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">INTEL_NOTES</div>
            <p className="text-[10px] text-on-surface/60 font-mono leading-relaxed uppercase tracking-tight">{deal.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 mt-auto">
        <button
          onClick={onClose}
          className="flex-1 py-4 bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_15px_rgba(255,23,68,0.4)]"
        >
          CLOSE_PANEL
        </button>
      </div>
    </div>
  );
};

export default function PipelinePage() {
  const { deals, dealsByStage, isLoading, isError, error } = useCRMDeals();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const selectedDeal = selectedDealId ? deals.find(d => d.id === selectedDealId) ?? null : null;

  if (isError) {
    return (
      <div>
        <h1 className="font-headline text-5xl font-black uppercase tracking-[0.05em] text-on-surface-bright mb-8">
          PIPELINE <span className="text-primary text-glow">VISUALIZER</span>
        </h1>
        <ErrorCard title="Pipeline Load Error" message={error?.message || 'Failed to load CRM pipeline'} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="font-headline text-5xl font-black uppercase tracking-[0.05em] text-on-surface-bright mb-2">
            PIPELINE <span className="text-primary drop-shadow-[0_0_8px_rgba(255,23,68,0.4)]">VISUALIZER</span>
          </h1>
          <p className="text-on-surface/40 font-mono text-[10px] uppercase tracking-[0.3em]">
            TACTICAL ASSET FLOW // <span className="text-primary">TELEMETRY_LINK_ESTABLISHED</span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-surface-high px-6 py-3 border border-on-surface/5 border-l-2 border-primary">
            <div className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest">GROSS_VALUE</div>
            <div className="font-mono text-xl font-bold text-primary tracking-tighter">${totalValue.toLocaleString()}</div>
          </div>
          <div className="bg-surface-high px-6 py-3 border border-on-surface/5 border-l-2 border-on-surface/30">
            <div className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest">ACTIVE_ASSETS</div>
            <div className="font-mono text-xl font-bold text-on-surface/80 tracking-tighter">{deals.length}</div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex gap-8">
          {STAGES.map(stage => (
            <div key={stage} className="flex-shrink-0 w-80">
              <CardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x">
          {STAGES.map(stage => {
            const stageDeals = dealsByStage[stage] || [];
            const isWon = stage === 'Won';
            return (
              <div key={stage} className="flex-shrink-0 w-80 snap-start">
                <div className="flex items-center justify-between mb-6 px-1 border-b border-on-surface/10 pb-2">
                  <h3 className="font-headline font-bold uppercase tracking-[0.2em] text-[11px] text-on-surface/60">
                    {stage} <span className="text-primary ml-2 font-mono">{String(stageDeals.length).padStart(2, '0')}</span>
                  </h3>
                </div>
                <div className={`flex flex-col gap-4 ${isWon ? 'opacity-40 grayscale contrast-125' : ''}`}>
                  {stageDeals.map((deal) => {
                    const isSelected = selectedDealId === deal.id;
                    return (
                      <div
                        key={deal.id}
                        className={`p-5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#12080a] ares-glow border-primary'
                            : 'bg-surface-2 border-on-surface/5 hover:border-primary/40'
                        }`}
                        onClick={() => setSelectedDealId(deal.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDealId(deal.id); } }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${deal.name}, $${(deal.value / 1000).toFixed(0)}K`}
                      >
                        <div className="text-[9px] font-mono text-primary/60 uppercase tracking-widest mb-1">
                          ID: {deal.id?.slice(0, 8) || 'N/A'}
                        </div>
                        <h4 className="font-bold text-on-surface uppercase mb-4 text-xs tracking-wider">
                          {deal.name}
                        </h4>
                        <div className="flex justify-between items-end">
                          <div className="font-mono text-lg font-bold text-on-surface/80 tracking-tighter">
                            ${deal.value.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stageDeals.length === 0 && (
                    <div className="text-on-surface/20 font-mono text-[10px] uppercase tracking-widest p-5">
                      EMPTY_QUEUE
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DealDetailPanel deal={selectedDeal} onClose={() => setSelectedDealId(null)} />
    </div>
  );
}
