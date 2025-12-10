export interface FilterCommune {
  id: number;
  name: string;
  slug: string;
  region: {
    id: number;
    name: string;
  };
}

export interface FilterCategory {
  id: number;
  name: string;
  slug: string;
}

export interface FilterResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface FilterState {
  filterCommunes: FilterCommune[];
  filterCategories: FilterCategory[];
  loading: boolean;
  error: string | null;
}
