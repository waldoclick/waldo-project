export interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CategoryResponse {
  data: Category[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface CategoryState {
  categories: Category[];
  category: Category | null;
  loading: boolean;
  error: string | null;
  lastFetch: number;
}
