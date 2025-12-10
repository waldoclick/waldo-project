export interface FAQ {
  id: number;
  title: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface FAQResponse {
  data: FAQ[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
