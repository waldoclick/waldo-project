// Strapi v5 API response shape types (formerly from @nuxtjs/strapi module augmentation)

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiMeta {
  pagination: StrapiPagination;
}

export interface StrapiResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export type StrapiData<T> = T;
