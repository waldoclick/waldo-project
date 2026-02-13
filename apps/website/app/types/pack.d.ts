export interface Pack {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // en días
  features: string[];
  total_ads: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
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
