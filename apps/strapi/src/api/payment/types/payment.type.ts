export type PackType = "free" | "paid" | true | false | number;
export type FeaturedType = "free" | true | false;

export interface Details {
  pack: PackType;
  featured: FeaturedType;
  is_invoice: boolean;
}

export interface AdData {
  ad_id?: number;
  name: string;
  description: string;
  address: string;
  address_number: string;
  phone: string;
  email: string;
  year: number;
  manufacturer: string;
  model: string;
  serial_number: string;
  weight: number;
  width: number;
  height: number;
  depth: number;
  commune: number;
  condition: number;
  category: number;
  currency: string;
  price: number;
  gallery: number[];
}

export interface AdReservation {
  id: number | string;
  documentId?: string;
  price?: string | number;
  total_days?: number;
  user?: string | number;
  ad?: any;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  publishedAt?: string | Date;
  description?: string;
  locale?: string;
}

export interface AdFeaturedReservationData {
  price: string | number;
  user: string | number;
  publishedAt: Date | string;
  description?: string;
  ad?: number;
}

export interface ReservationResponse {
  success: boolean;
  availableAdFeaturedReservation?: any;
  adFeaturedReservation?: any;
  message?: string;
}

export interface OrderData {
  user?: number | string;
  ad?: number;
  status?: string;
  amount?: number;
  payment_method?: string;
  payment_id?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface OrderResponse {
  success: boolean;
  order?: any;
  message?: string;
}

export interface PackData {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  total_ads?: number;
  total_days?: number;
  total_features?: number;
  is_active?: boolean;
  [key: string]: any;
}

export interface PackResponse {
  success: boolean;
  data?: PackData;
  message?: string;
}

export interface AdReservationData {
  user: string | number;
  price: string | number;
  total_days: number;
  description?: string;
  ad?: number;
  publishedAt?: Date | string;
}

export interface AdReservationsResponse {
  success: boolean;
  adReservations?: AdReservation[];
  adReservation?: AdReservation;
  message?: string;
}
