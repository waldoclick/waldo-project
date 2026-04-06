export type AdStatus =
  | "pending"
  | "active"
  | "archived"
  | "banned"
  | "rejected"
  | "abandoned";

export interface AdGalleryItem {
  id?: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
    [key: string]: { url: string } | undefined;
  };
}

export interface Ad {
  id: number;
  documentId?: string;
  name: string;
  slug?: string;
  status?: AdStatus;
  description?: string;
  price?: number;
  currency?: string;
  phone?: string;
  email?: string;
  address?: string;
  address_number?: string;
  duration_days?: number;
  remaining_days?: number;
  reason_for_ban?: string;
  banned_at?: string;
  featured?: boolean;
  reason_for_rejection?: string;
  rejected_at?: string;
  createdAt: string;
  updatedAt?: string;
  user?: { username: string };
  gallery?: AdGalleryItem[];
  category?: { id: number; name: string };
  condition?: { id: number; name: string };
  commune?: { id: number; name: string };
}
