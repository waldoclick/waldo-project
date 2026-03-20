// plugins/seo.ts
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const baseUrl = useRuntimeConfig().public.baseUrl as string;
  const DEFAULT_IMAGE = `${baseUrl}/images/share.jpg`;

  // Define a global function for setting SEO meta tags
  nuxtApp.provide(
    "setSEO",
    (params: {
      title: string;
      description: string;
      imageUrl?: string;
      url?: string;
      ogType?: string;
      twitterCard?: string;
    }) => {
      useSeoMeta({
        title: params.title,
        description: params.description,
        ogTitle: params.title,
        ogDescription: params.description,
        ogImage: params.imageUrl || DEFAULT_IMAGE,
        ogUrl: params.url,
        ogType: (params.ogType || "website") as
          | "website"
          | "article"
          | "book"
          | "profile",
        twitterCard: (params.twitterCard || "summary_large_image") as
          | "summary"
          | "summary_large_image"
          | "app"
          | "player",
        twitterTitle: params.title,
        twitterDescription: params.description,
      });
    },
  );
});

// Add type declaration for better TypeScript support
declare module "#app" {
  interface NuxtApp {
    $setSEO: (params: {
      title: string;
      description: string;
      imageUrl?: string;
      url?: string;
      ogType?: string;
      twitterCard?: string;
    }) => void;
  }
}
