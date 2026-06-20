/**
 * Flat, payload-safe shape for an ad shown in the blog article sidebar
 * ("Destacados en Waldo"). Kept primitive-only so it serializes cleanly into
 * the page payload (full ad records with populate trip devalue).
 */
export interface FeaturedAd {
  slug: string;
  name: string;
  price: number | null;
  categoryName: string;
  image: string;
}
