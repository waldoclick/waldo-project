export interface Ad {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  address_number: string;
  phone: string;
  email: string;
  year: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  weight: string;
  width: string;
  height: string;
  depth: string;
  price: string;
  active: boolean;
  rejected: boolean;
  reason_for_rejection: string | null;
  reason_for_ban: string | null;
  reason_for_deactivation?: string | null;
  banned?: boolean;
  banned_at?: string | null;
  rejected_at?: string | null;
  currency: string;
  duration_days: number;
  remaining_days: number;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  locale: string | null;
  publishedAt: string;
  details: {
    pack?: number;
    featured?: boolean;
    is_invoice?: boolean;
    [key: string]: any;
  };
  category?: {
    id: number;
  };
}

export interface QueryParams {
  id?: string;
  limit?: string | number;
}
