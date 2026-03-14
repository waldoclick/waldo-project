export interface Pack {
  id: number;
  name: string;
  price: number;
  total_ads: number;
  total_days: number;
  total_features?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  recommended?: boolean;
  quantity?: number;
}

export interface PackResponse {
  data: Pack[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface PackState {
  packs: Pack[];
  loading: boolean;
  error: string | null;
}

export interface PackSelectionState {
  pack: number;
  is_invoice: boolean;
}
