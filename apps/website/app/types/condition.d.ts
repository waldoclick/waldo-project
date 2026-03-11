export interface Condition {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ConditionResponse {
  data: Condition[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface ConditionState {
  conditions: Condition[];
  loading: boolean;
  error: string | null;
  lastFetch: number;
}
