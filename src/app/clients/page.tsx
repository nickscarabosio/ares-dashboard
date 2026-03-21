'use client';

import { useState, useMemo, useEffect } from 'react';
import { useClientsData, type Client } from '@/hooks/useClientsData';
import { ErrorCard, CardSkeleton } from '@/components/common';

interface SortConfig { key: keyof Client; direction: 'asc' | 'desc'; }

const ClientDetailPanel: React.FC<{ client: Client | null; onClose: () => void }> = ({ client, onClose }) => {
  useEffect(() => {
    if (!client) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [client, onClose]);

  if (!client) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-detail-title"
      className="fixed top-16 right-0 h-[calc(100vh-64px)] w-[400px] glass-hud border-l-2 border-primary/30 p-10 z-30 overflow-y-auto"
    >
      <div className="flex justify-between items-start mb-10">
        <div>
          <span className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] mb-2 font-bold block">
            CLIENT_DOSSIER
          </span>
          <h2 id="client-detail-title" className="font-headline text-3xl font-black uppercase tracking-tight text-on-surface-bright">
            {client.name}
          </h2>
        </div>
        <button onClick={onClose} aria-label="Close detail panel" className="text-on-surface/30 hover:text-primary transition-colors text-2xl">
          &times;
        </button>
      </div>
      <div className="space-y-4">
        {[
          { label: 'STATUS', value: client.status?.toUpperCase(), color: client.status === 'active' ? 'text-clinical-mint' : 'text-on-surface' },
          { label: 'REVENUE_STREAM', value: `$${(client.mrr || 0).toLocaleString()}/MO` },
          { label: 'LAST_CONTACT', value: client.last_contact || 'N/A' },
          { label: 'CONTACT_NODE', value: client.contact_email || 'N/A' },
          { label: 'NEXT_ACTION', value: client.next_action || 'N/A' },
          { label: 'INTEL_NOTES', value: client.notes || 'N/A' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-background p-4">
            <div className="text-[8px] uppercase font-mono text-on-surface/30 mb-2 tracking-[0.2em]">{label}</div>
            <div className={`text-[11px] font-bold uppercase tracking-widest ${color || 'text-on-surface'}`}>{value}</div>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-8 w-full py-4 bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_15px_rgba(255,23,68,0.4)]"
      >
        CLOSE_PANEL
      </button>
    </div>
  );
};

export default function ClientsPage() {
  const { clients, isLoading, isError, error } = useClientsData();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const filteredAndSorted = useMemo(() => {
    let filtered = clients.filter(
      (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    return filtered;
  }, [clients, searchTerm, sortConfig]);

  const handleSort = (key: keyof Client) => {
    setSortConfig((prev) => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const totalMRR = clients.reduce((sum, c) => sum + (c.mrr || 0), 0);
  const activeCount = clients.filter(c => c.status === 'active').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="font-headline text-5xl font-black uppercase tracking-[0.05em] text-on-surface-bright mb-2">
            CLIENT <span className="text-primary drop-shadow-[0_0_8px_rgba(255,23,68,0.4)]">REGISTRY</span>
          </h1>
          <p className="text-on-surface/40 font-mono text-[10px] uppercase tracking-[0.3em]">
            RELATIONSHIP_ENGINE // <span className="text-clinical-mint">ACTIVE_MONITORING</span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-surface-high px-6 py-3 border border-on-surface/5 border-l-2 border-primary">
            <div className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest">TOTAL_MRR</div>
            <div className="font-mono text-xl font-bold text-primary tracking-tighter">${totalMRR.toLocaleString()}</div>
          </div>
          <div className="bg-surface-high px-6 py-3 border border-on-surface/5 border-l-2 border-clinical-mint">
            <div className="text-[9px] uppercase font-mono text-on-surface/30 tracking-widest">ACTIVE_NODES</div>
            <div className="font-mono text-xl font-bold text-clinical-mint tracking-tighter">{activeCount}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="SEARCH_CLIENTS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search clients"
          className="w-full max-w-md bg-surface-0 border-0 border-b-2 border-outline text-on-surface font-mono text-[11px] uppercase tracking-widest px-4 py-3 focus:border-primary focus:outline-none focus:shadow-[0_2px_8px_rgba(255,23,68,0.3)] transition-all placeholder:text-on-surface/20"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
      ) : isError ? (
        <ErrorCard title="Failed to Load Clients" message={error?.message || 'Could not fetch client data'} onRetry={() => window.location.reload()} />
      ) : (
        <div className="bg-surface-0 border border-outline overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px]">
            <thead>
              <tr className="bg-black/40 border-b border-outline">
                {(['name', 'status', 'mrr', 'last_contact'] as const).map(key => (
                  <th key={key} className="p-4">
                    <button
                      onClick={() => handleSort(key)}
                      className="uppercase tracking-[0.2em] text-on-surface/30 hover:text-primary transition-colors"
                    >
                      {key.toUpperCase().replace('_', '_')}
                      {sortConfig.key === key && (
                        <span className="ml-1 text-primary">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th>
                ))}
                <th className="p-4 uppercase tracking-[0.2em] text-on-surface/30">NEXT_ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {filteredAndSorted.map((client) => (
                <tr
                  key={client.client_id}
                  onClick={() => setSelectedClient(client)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedClient(client); } }}
                  className="hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <td className="p-4 font-bold tracking-widest text-on-surface">{client.name.toUpperCase()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-2 ${client.status === 'active' ? 'text-clinical-mint' : 'text-on-surface/40'}`}>
                      <span className={`inline-block w-1.5 h-1.5 ${client.status === 'active' ? 'bg-clinical-mint clinical-glow' : 'bg-on-surface/30'}`} />
                      {client.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-primary font-bold">${(client.mrr || 0).toLocaleString()}</td>
                  <td className="p-4 text-on-surface/40">{client.last_contact || '—'}</td>
                  <td className="p-4 text-on-surface/40">{client.next_action || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSorted.length === 0 && (
            <div className="p-8 text-center text-on-surface/20 font-mono text-[10px] uppercase tracking-widest">
              NO_MATCHING_RECORDS
            </div>
          )}
        </div>
      )}

      <ClientDetailPanel client={selectedClient} onClose={() => setSelectedClient(null)} />
    </div>
  );
}
