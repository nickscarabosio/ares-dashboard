export interface Core4Metric {
  title: 'Fitness' | 'Flow' | 'Family' | 'Finance';
  value: string | number;
  unit: string;
  progress: number;
  status: 'active' | 'idle' | 'offline';
  color: 'red' | 'yellow' | 'green';
}

export const mockCore4Data: Core4Metric[] = [
  { title: 'Fitness', value: '7.2', unit: 'Strain', progress: 72, status: 'active', color: 'red' },
  { title: 'Flow', value: '6.8', unit: 'Focus Score', progress: 68, status: 'active', color: 'red' },
  { title: 'Family', value: 'Good', unit: 'Health', progress: 85, status: 'active', color: 'green' },
  { title: 'Finance', value: '$842K', unit: 'ARR', progress: 91, status: 'active', color: 'green' },
];

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
}

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'cal-1', title: 'Client Call: Acme Corp', time: '3:00 PM', date: 'Today' },
  { id: 'cal-2', title: 'Team Standup', time: '10:00 AM', date: 'Tomorrow' },
  { id: 'cal-3', title: 'Pipeline Review', time: '2:00 PM', date: 'Tomorrow' },
];

export interface AgentStatus {
  name: 'Casper' | 'Jeeves' | 'Arnold';
  status: 'active' | 'idle' | 'offline';
  tasks: number;
  lastSeen: string;
}

export const mockAgentStatuses: AgentStatus[] = [
  { name: 'Casper', status: 'active', tasks: 5, lastSeen: 'now' },
  { name: 'Jeeves', status: 'active', tasks: 3, lastSeen: 'now' },
  { name: 'Arnold', status: 'idle', tasks: 1, lastSeen: '12 min ago' },
];

export interface RevenueSnapshot {
  label: string;
  amount: string;
  trend?: string;
}

export const mockRevenueData: RevenueSnapshot[] = [
  { label: 'Week YTD', amount: '$42.5K', trend: '+12%' },
  { label: 'Month YTD', amount: '$187.3K', trend: '+8%' },
  { label: 'Pipeline', amount: '$245K', trend: '7 active' },
  { label: '180-day Runway', amount: 'Solid', trend: '✓' },
];

export type TimelineEventType = 'overdue' | 'warning' | 'stable';

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  dayOfWeek: string;
  type: TimelineEventType;
  priority?: 'high' | 'medium' | 'low';
}

const today = new Date();
const getDate = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d;
};

const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatDayOfWeek = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });

export const mockTimelineData: TimelineEvent[] = [
  { id: 'timeline-1', title: 'Q3_FISCAL_AUDIT', date: formatDate(getDate(0)), dayOfWeek: formatDayOfWeek(getDate(0)), type: 'overdue', priority: 'high' },
  { id: 'timeline-2', title: 'PARTNER_OUTREACH', date: formatDate(getDate(1)), dayOfWeek: formatDayOfWeek(getDate(1)), type: 'warning', priority: 'high' },
  { id: 'timeline-3', title: 'BETA_DEPLOY', date: formatDate(getDate(1)), dayOfWeek: formatDayOfWeek(getDate(1)), type: 'stable', priority: 'medium' },
  { id: 'timeline-4', title: 'CLIENT_MEETING', date: formatDate(getDate(2)), dayOfWeek: formatDayOfWeek(getDate(2)), type: 'stable', priority: 'medium' },
  { id: 'timeline-5', title: 'FEATURE_RELEASE', date: formatDate(getDate(3)), dayOfWeek: formatDayOfWeek(getDate(3)), type: 'warning', priority: 'medium' },
  { id: 'timeline-6', title: 'STRATEGY_SESSION', date: formatDate(getDate(4)), dayOfWeek: formatDayOfWeek(getDate(4)), type: 'stable', priority: 'low' },
  { id: 'timeline-7', title: 'QUARTERLY_REVIEW', date: formatDate(getDate(5)), dayOfWeek: formatDayOfWeek(getDate(5)), type: 'overdue', priority: 'high' },
  { id: 'timeline-8', title: 'MARKET_RESEARCH', date: formatDate(getDate(6)), dayOfWeek: formatDayOfWeek(getDate(6)), type: 'stable', priority: 'low' },
];

export const useCore4Data = () => mockCore4Data;
export const useCalendarData = () => mockCalendarEvents;
export const useAgentStatusData = () => mockAgentStatuses;
export const useRevenueData = () => mockRevenueData;
export const useTimelineData = () => mockTimelineData;
