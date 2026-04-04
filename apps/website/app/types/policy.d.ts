export interface Policy {
  id: number;
  title: string;
  text: string;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface PolicyResponse {
  data: Policy[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
