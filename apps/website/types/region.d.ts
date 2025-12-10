export interface Region {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  publishedAt: string | null;
}

export interface RegionResponse {
  data: Region[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface RegionState {
  regions: RegionResponse;
  loading: boolean;
  error: string | null;
}
