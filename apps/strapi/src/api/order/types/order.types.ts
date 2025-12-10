/**
 * Order Types
 * ===========
 *
 * Type definitions for the order API endpoints and controllers.
 */

export interface PaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface QueryParams {
  filters?: any;
  pagination?: {
    page?: string;
    pageSize?: string;
  };
  sort?: any;
  populate?: any;
}

export interface Order {
  id: number;
  documentId: string;
  amount: string;
  buy_order: string;
  is_invoice: boolean;
  payment_method: string;
  payment_response: any;
  createdAt: string;
  updatedAt: string;
  document_details: any;
  locale: string | null;
  publishedAt: string;
}
