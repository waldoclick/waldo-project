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
  filters?: unknown;
  pagination?: {
    page?: string;
    pageSize?: string;
  };
  sort?: unknown;
  populate?: unknown;
}

export interface Order {
  id: number;
  documentId: string;
  amount: string;
  buy_order: string;
  is_invoice: boolean;
  payment_method: string;
  payment_response: unknown;
  createdAt: string;
  updatedAt: string;
  document_details: unknown;
  locale: string | null;
  publishedAt: string;
}
