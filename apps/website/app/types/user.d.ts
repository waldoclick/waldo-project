export interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  firstname: string;
  lastname: string;
  rut: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  publishedAt: string;
  is_company: boolean;
  address: string | null;
  address_number: string | null;
  birthdate: string | null;
  pro_status: "active" | "inactive" | "cancelled" | null;
  pro_card_type: string | null;
  pro_card_last4: string | null;
  pro_expires_at: string | null;
  accepted_age_confirmation: boolean;
  accepted_terms: boolean;
  accepted_usage_terms: boolean;
  postal_code: string | null;
  commune: {
    id: number;
    name: string;
    region: {
      id: number;
      name: string;
    };
  } | null;
  business_name: string | null;
  business_type: string | null;
  business_rut: string | null;
  business_address: string | null;
  business_address_number: string | null;
  business_postal_code: string | null;
  business_commune: {
    id: number;
    name: string;
    region: {
      id: number;
      name: string;
    };
  } | null;
  avatar: {
    formats: {
      [key: string]: {
        url: string;
      };
    };
    url: string;
  } | null;
  cover: {
    formats: {
      [key: string]: {
        url: string;
      };
    };
    url: string;
  } | null;
  role?: {
    id: number;
    name: string;
    type: string;
  };
  ad_reservations?: AdReservation[];
  ad_featured_reservations?: AdFeaturedReservation[];
  ads?: Record<string, unknown>[];
  orders?: Record<string, unknown>[];
  freeAdReservationsCount?: number;
  paidAdReservationsCount?: number;
  adFeaturedReservationsCount?: number;
}

export interface AdReservation {
  id: number;
  price: string;
  total_days: number;
  description: string;
  ad: {
    id: number;
    title: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  publishedAt: string;
}

export interface AdFeaturedReservation {
  id: number;
  price: string;
  description: string;
  total_days: number | null;
  ad: {
    id: number;
    title: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  publishedAt: string;
}
