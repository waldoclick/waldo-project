import {
  BetterStackMonitor,
  BetterStackIncident,
  IBetterStackService,
} from "../types/better-stack.types";

export class BetterStackService implements IBetterStackService {
  private apiToken: string;
  private baseUrl = "https://uptime.betterstack.com/api/v2";

  constructor() {
    this.apiToken = process.env.BETTER_STACK_API_TOKEN || "";

    if (!this.apiToken) {
      throw new Error("BETTER_STACK_API_TOKEN is required");
    }
  }

  private async apiFetch<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Better Stack API error: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as T;
  }

  async getMonitors(): Promise<BetterStackMonitor[]> {
    const data = await this.apiFetch<{ data: any[] }>("/monitors", {
      per_page: "50",
    });

    return (data.data ?? []).map((item) => {
      const attr = item.attributes ?? {};
      return {
        id: item.id as string,
        name: (attr.pronounceable_name || attr.url) as string,
        url: attr.url as string,
        status: attr.status ?? "pending",
        lastCheckedAt: attr.last_checked_at ?? null,
        checkFrequency: attr.check_frequency ?? 0,
      };
    });
  }

  async getIncidents(): Promise<BetterStackIncident[]> {
    const data = await this.apiFetch<{ data: any[] }>("/incidents", {
      per_page: "25",
    });

    return (data.data ?? []).map((item) => {
      const attr = item.attributes ?? {};
      const startedAt: string = attr.started_at ?? "";
      const resolvedAt: string | null = attr.resolved_at ?? null;
      const duration =
        startedAt && resolvedAt
          ? Math.round(
              (new Date(resolvedAt).getTime() - new Date(startedAt).getTime()) /
                1000 /
                60
            )
          : null;

      return {
        id: item.id as string,
        monitorName: attr.name as string,
        url: attr.url as string,
        cause: attr.cause ?? "",
        status: attr.status ?? "",
        startedAt,
        resolvedAt,
        acknowledgedAt: attr.acknowledged_at ?? null,
        duration,
      };
    });
  }
}
