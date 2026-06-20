export interface BlogCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface BlogCategoryResponse {
  data: BlogCategory[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface BlogCategoryState {
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
}
