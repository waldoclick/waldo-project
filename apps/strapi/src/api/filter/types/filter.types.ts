export interface BaseEntity {
  id: number;
  documentId: string;
  locale?: string;
  createdAt?: string;
  name?: string;
  publishedAt?: string;
  slug?: string;
  updatedAt?: string;
}

export interface Region extends BaseEntity {
  name: string;
}

export interface Commune extends BaseEntity {
  name: string;
  region?: Region;
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  color: string;
  icon?: unknown;
  count?: number;
}

export interface FilterResponse<T> {
  data: T[];
}

export interface StrapiFilter {
  [key: string]: {
    $eq?: unknown;
    $ne?: unknown;
    $lt?: unknown;
    $lte?: unknown;
    $gt?: unknown;
    $gte?: unknown;
    $in?: unknown[];
    $nin?: unknown[];
    $contains?: unknown;
    $notContains?: unknown;
    $containsi?: unknown;
    $notContainsi?: unknown;
  };
}
