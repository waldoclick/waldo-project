export interface Term {
  id: number;
  title: string;
  text: string;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface TermResponse {
  data: Term[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
