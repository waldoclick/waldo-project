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
  icon?: any;
  count?: number;
}

export interface FilterResponse<T> {
  data: T[];
}

export interface StrapiFilter {
  [key: string]: {
    $eq?: any;
    $ne?: any;
    $lt?: any;
    $lte?: any;
    $gt?: any;
    $gte?: any;
    $in?: any[];
    $nin?: any[];
    $contains?: any;
    $notContains?: any;
    $containsi?: any;
    $notContainsi?: any;
  };
}
