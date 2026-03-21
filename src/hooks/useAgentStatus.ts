'use client';

import { useEffect, useMemo, useState } from 'react';
import agentsConfig from '@/lib/agents.json';

export type AgentRuntimeStatus = 'active' | 'idle' | 'error' | 'sleeping';

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  reportsTo: string | null;
  description: string;
  lastDeployed: string;
  type: string;
}

interface VaultAgentStatus {
  name: string;
  status?: 'active' | 'idle' | 'offline';
  task_count?: number;
  last_activity?: string | null;
}

export interface AgentActivityItem {
  agent: string;
  job: string;
  status: 'success' | 'warning' | 'error' | 'running';
  time: string;
}

export interface AgentStatus extends AgentConfig {
  status: AgentRuntimeStatus;
  currentJob: string;
  progress: number;
  lastActivityAt: string | null;
  lastActivityLabel: string;
  lastDeployedAt: string;
  lastDeployedLabel: string;
  currentTaskLabel: string;
}

interface UseAgentStatusResult {
  agents: AgentStatus[];
  activity: AgentActivityItem[];
  summary: {
    total: number;
    active: number;
    idle: number;
    error: number;
    sleeping: number;
  };
  isLoading: boolean;
}

const DEPLOYMENTS_STORAGE_KEY = 'agents_deployments';
const ACTIVITY_STORAGE_KEY = 'agent_activity';
const STATUS_STORAGE_KEY = 'agent_jobs';
const STORAGE_EVENT = 'agents-dashboard-storage';
const MAX_ACTIVITY_ITEMS = 50;
const ACTIVITY_TTL_MS = 24 * 60 * 60 * 1000;
const IDLE_THRESHOLD_MS = 5 * 60 * 1000;

const defaultJobs: Record<string, { currentJob: string; progress: number; status?: AgentRuntimeStatus; lastActivityAt: string }> = {
  casper: { currentJob: 'Routing Telegram inbox', progress: 42, status: 'active', lastActivityAt: '2026-03-21T12:28:00Z' },
  forge: { currentJob: 'Shipping agent dashboard', progress: 75, status: 'active', lastActivityAt: '2026-03-21T12:30:00Z' },
  jeeves: { currentJob: 'Completing morning triage', progress: 100, status: 'idle', lastActivityAt: '2026-03-21T12:05:00Z' },
  mercury: { currentJob: 'Refreshing pipeline snapshot', progress: 18, status: 'active', lastActivityAt: '2026-03-21T12:24:00Z' },
  arnold: { currentJob: 'Syncing WHOOP recovery', progress: 64, status: 'active', lastActivityAt: '2026-03-21T12:29:00Z' },
  shaman: { currentJob: 'Queued for 07:45 reading', progress: 0, status: 'sleeping', lastActivityAt: '2026-03-21T11:45:00Z' },
  scout: { currentJob: 'Awaiting Forge handoff', progress: 0, status: 'sleeping', lastActivityAt: '2026-03-21T11:52:00Z' },
  poe: { currentJob: 'Drafting founder post', progress: 33, status: 'active', lastActivityAt: '2026-03-21T12:18:00Z' },
  atlas: { currentJob: 'Auditing internal links', progress: 56, status: 'active', lastActivityAt: '2026-03-21T12:12:00Z' },
  arc: { currentJob: 'Idle: no skill job assigned', progress: 0, status: 'idle', lastActivityAt: '2026-03-21T10:45:00Z' },
  fathom: { currentJob: 'Transcript router complete', progress: 100, status: 'idle', lastActivityAt: '2026-03-21T12:00:00Z' },
};

const defaultActivity: AgentActivityItem[] = [
  { agent: 'Forge', job: 'Pushed dashboard code', status: 'success', time: '2026-03-21T12:30:00Z' },
  { agent: 'Arnold', job: 'Syncing health telemetry', status: 'running', time: '2026-03-21T12:29:00Z' },
  { agent: 'Casper', job: 'Processed Telegram routing batch', status: 'success', time: '2026-03-21T12:28:00Z' },
  { agent: 'Mercury', job: 'Forecast variance warning', status: 'warning', time: '2026-03-21T12:24:00Z' },
  { agent: 'Poe', job: 'Prepared LinkedIn draft', status: 'success', time: '2026-03-21T12:18:00Z' },
  { agent: 'Jeeves', job: 'Completed email triage', status: 'success', time: '2026-03-21T12:05:00Z' },
  { agent: 'Fathom', job: 'Processed meeting transcript', status: 'success', time: '2026-03-21T12:00:00Z' },
  { agent: 'Scout', job: 'Regression run blocked on build artifact', status: 'error', time: '2026-03-21T11:58:00Z' }
];

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatRelativeTime(value: string | null, now: number): string {
  if (!value) {
    return 'No signal';
  }

  const diff = now - new Date(value).getTime();

  if (diff < 30 * 1000) {
    return 'Just now';
  }

  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function normalizeStatus(
  explicitStatus: AgentRuntimeStatus | undefined,
  progress: number,
  lastActivityAt: string | null,
  now: number
): AgentRuntimeStatus {
  if (explicitStatus === 'error') {
    return 'error';
  }

  if (explicitStatus === 'sleeping') {
    return 'sleeping';
  }

  if (progress > 0 && progress < 100) {
    return 'active';
  }

  if (lastActivityAt && now - new Date(lastActivityAt).getTime() <= IDLE_THRESHOLD_MS) {
    return 'active';
  }

  return 'idle';
}

function readBrowserState() {
  const deployments = parseJson<Record<string, string>>(window.localStorage.getItem(DEPLOYMENTS_STORAGE_KEY), {});
  const jobState = parseJson<Record<string, { currentJob: string; progress: number; status?: AgentRuntimeStatus; lastActivityAt: string }>>(
    window.localStorage.getItem(STATUS_STORAGE_KEY),
    defaultJobs
  );
  const activity = parseJson<AgentActivityItem[]>(window.localStorage.getItem(ACTIVITY_STORAGE_KEY), defaultActivity);

  return { deployments, jobState, activity };
}

function seedBrowserState() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.localStorage.getItem(STATUS_STORAGE_KEY)) {
    window.localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(defaultJobs));
  }

  if (!window.localStorage.getItem(ACTIVITY_STORAGE_KEY)) {
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(defaultActivity));
  }

  if (!window.localStorage.getItem(DEPLOYMENTS_STORAGE_KEY)) {
    const seededDeployments = Object.fromEntries(
      agentsConfig.agents.map((agent) => [agent.id, agent.lastDeployed])
    );
    window.localStorage.setItem(DEPLOYMENTS_STORAGE_KEY, JSON.stringify(seededDeployments));
  }
}

export function useAgentStatus(): UseAgentStatusResult {
  const [vaultAgents, setVaultAgents] = useState<VaultAgentStatus[]>([]);
  const [storageVersion, setStorageVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    seedBrowserState();

    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch('/api/agents', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch live agent status');
        }

        const next = (await response.json()) as VaultAgentStatus[];
        if (mounted) {
          setVaultAgents(next);
        }
      } catch {
        if (mounted) {
          setVaultAgents([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    const handleStorage = () => setStorageVersion((value) => value + 1);
    const interval = window.setInterval(() => setNow(Date.now()), 60 * 1000);

    window.addEventListener('storage', handleStorage);
    window.addEventListener(STORAGE_EVENT, handleStorage);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(STORAGE_EVENT, handleStorage);
    };
  }, []);

  const { agents, activity, summary } = useMemo(() => {
    void storageVersion;

    const browserState = typeof window === 'undefined'
      ? {
          deployments: {} as Record<string, string>,
          jobState: defaultJobs,
          activity: defaultActivity,
        }
      : readBrowserState();

    const liveStatusByName = new Map(
      vaultAgents.map((agent) => [agent.name.toLowerCase(), agent])
    );

    const filteredActivity = browserState.activity
      .filter((item) => now - new Date(item.time).getTime() <= ACTIVITY_TTL_MS)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, MAX_ACTIVITY_ITEMS);

    const mergedAgents = agentsConfig.agents.map((agent) => {
      const live = liveStatusByName.get(agent.name.toLowerCase());
      const stored = browserState.jobState[agent.id] ?? {
        currentJob: 'Idle: no current assignment',
        progress: 0,
        lastActivityAt: live?.last_activity ?? null,
      };

      const lastActivityAt = live?.last_activity ?? stored.lastActivityAt ?? null;
      const progress = typeof live?.task_count === 'number'
        ? Math.min(live.task_count * 20, 100)
        : stored.progress;

      const statusFromLive: AgentRuntimeStatus | undefined = live?.status === 'offline'
        ? 'error'
        : live?.status === 'active'
        ? 'active'
        : live?.status === 'idle'
        ? 'idle'
        : undefined;

      const status = normalizeStatus(stored.status ?? statusFromLive, progress, lastActivityAt, now);
      const lastDeployedAt = browserState.deployments[agent.id] ?? agent.lastDeployed;

      return {
        ...agent,
        progress,
        status,
        currentJob: stored.currentJob,
        currentTaskLabel: stored.currentJob,
        lastActivityAt,
        lastActivityLabel: formatRelativeTime(lastActivityAt, now),
        lastDeployedAt,
        lastDeployedLabel: formatRelativeTime(lastDeployedAt, now),
      };
    });

    const counts = mergedAgents.reduce(
      (acc, agent) => {
        acc[agent.status] += 1;
        return acc;
      },
      { active: 0, idle: 0, error: 0, sleeping: 0 }
    );

    return {
      agents: mergedAgents,
      activity: filteredActivity,
      summary: {
        total: mergedAgents.length,
        active: counts.active,
        idle: counts.idle,
        error: counts.error,
        sleeping: counts.sleeping,
      },
    };
  }, [now, storageVersion, vaultAgents]);

  return { agents, activity, summary, isLoading };
}

export function setAgentDeployment(agentId: string, deployedAt: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const deployments = parseJson<Record<string, string>>(window.localStorage.getItem(DEPLOYMENTS_STORAGE_KEY), {});
  deployments[agentId] = deployedAt;
  window.localStorage.setItem(DEPLOYMENTS_STORAGE_KEY, JSON.stringify(deployments));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function pushAgentActivity(entry: AgentActivityItem) {
  if (typeof window === 'undefined') {
    return;
  }

  const activity = parseJson<AgentActivityItem[]>(window.localStorage.getItem(ACTIVITY_STORAGE_KEY), defaultActivity);
  const nextActivity = [entry, ...activity]
    .filter((item) => Date.now() - new Date(item.time).getTime() <= ACTIVITY_TTL_MS)
    .slice(0, MAX_ACTIVITY_ITEMS);

  window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(nextActivity));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}
