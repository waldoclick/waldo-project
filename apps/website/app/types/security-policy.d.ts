export interface SecurityPolicy {
  id: number;
  documentId: string;
  title: string;
  text: string;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface SecurityPolicyResponse {
  data: SecurityPolicy[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
