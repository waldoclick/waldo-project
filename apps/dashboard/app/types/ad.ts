export type AdStatus =
  | "pending"
  | "active"
  | "archived"
  | "banned"
  | "rejected"
  | "abandoned";

export interface AdGalleryItem {
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
  name: string;
  slug?: string;
  status?: AdStatus;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  user?: { username: string };
  gallery?: AdGalleryItem[];
  category?: { id: number; name: string };
}
