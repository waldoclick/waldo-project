import type { User } from "@/types/user";
import type { Category } from "@/types/category";

export interface Media {
  formats: {
    thumbnail: {
      url: string;
    };
    medium?: {
      url: string;
    };
  };
}

export interface GalleryItem extends Media {
  id: string;
  url: string;
  type?: string;
}

export interface Announcement {
  id: number;
  name: string;
  slug: string;
  category: Category;
  user: User;
  gallery: Media[];
  ad_reservation: {
    price: number;
  };
  ad_featured_reservation?: boolean;
  price: number;
  currency: string;
  remaining_days: number;
}

export interface Ad {
  id: number;
  title: string;
  description: string;
  name: string;
  slug: string;
  category: number;
  user: User;
  gallery: GalleryItem[];
  ad_reservation: boolean;
  price: number;
  currency: string;
  remaining_days: number;
  email: string;
  phone: string;
  region: number | null;
  commune: number | null;
  address: string;
  address_number: string;
  condition: number | null;
  manufacturer: string;
  model: string;
  year: number;
  serial_number: string;
  weight: number;
  width: number;
  height: number;
  depth: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdResponse {
  data: Ad[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export type AdForm = Omit<
  Ad,
  "id" | "title" | "slug" | "user" | "ad_reservation" | "remaining_days"
>;

export interface Company {
  name: string;
  rut: string;
  email: string;
  address: string;
  address_number: string;
  commune: number | null;
}

export type PackType = "free" | "paid" | number;
export type FeaturedType = "free" | true | false;

export interface AdState {
  step: number;
  pack: PackType;
  featured: FeaturedType;
  is_invoice: boolean;
  ad: AdForm;
  company: Company;
}

export interface AdsStoreState {
  ads: Ad[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}
