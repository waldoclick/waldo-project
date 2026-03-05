import type { User } from "./user";

export interface OrderUser extends Pick<
  User,
  "username" | "email" | "firstname" | "lastname" | "phone"
> {}

export interface OrderAd {
  id: number | string;
  name: string;
  slug?: string;
}

export interface Order {
  id: number;
  documentId?: string;
  buy_order?: string;
  amount: number | string;
  payment_method: string;
  is_invoice: boolean;
  items?: string;
  payment_response?: string;
  document_details?: string;
  document_response?: string;
  createdAt: string;
  updatedAt?: string;
  user?: OrderUser;
  ad?: OrderAd | null;
}

export interface OrdersListResponse {
  data: Order[];
  meta: {
    pagination: {
      page: number;
      pageCount: number;
      total: number;
    };
  };
}
