declare module "#app" {
  interface NuxtApp {
    $strapi: ReturnType<typeof import("@nuxtjs/strapi").useStrapi>;
  }
}

declare module "@nuxtjs/strapi" {
  interface StrapiPagination {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  }

  interface StrapiMeta {
    pagination: StrapiPagination;
  }

  interface StrapiResponse<T> {
    data: T[];
    meta: StrapiMeta;
  }

  type StrapiData<T> = T;
}

export {};
