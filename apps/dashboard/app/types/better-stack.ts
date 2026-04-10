export type MonitorStatus =
  | "up"
  | "down"
  | "paused"
  | "pending"
  | "maintenance"
  | "validating";

export interface BetterStackMonitor {
  id: string;
  name: string;
  url: string;
  status: MonitorStatus;
  lastCheckedAt: string | null;
  checkFrequency: number;
}

export interface BetterStackIncident {
  id: string;
  monitorName: string;
  url: string;
  cause: string;
  startedAt: string;
  resolvedAt: string | null;
  acknowledgedAt: string | null;
  duration: number | null;
}
