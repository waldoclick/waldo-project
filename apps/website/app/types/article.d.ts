import type { Category } from "@/types/category";
import type { Media, GalleryItem } from "@/types/ad";

export interface Article {
  id: number;
  documentId: string;
  title: string;
  header: string;
  body: string;
  slug: string;
  cover: Media[];
  gallery: GalleryItem[];
  categories: Category[];
  seo_title: string | null;
  seo_description: string | null;
  source_url: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface ArticleResponse {
  data: Article[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
