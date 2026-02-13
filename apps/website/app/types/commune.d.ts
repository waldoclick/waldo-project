export interface Region {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  publishedAt: null;
}

export interface Commune {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  publishedAt: null;
  region: Region;
}

export interface CommuneResponse {
  data: Commune[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface CommuneState {
  communes: CommuneResponse;
  loading: boolean;
  error: string | null;
}
