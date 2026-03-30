import { stringify } from "qs";
import type { FetchOptions } from "ofetch";
import { useRuntimeConfig } from "#imports";

export const useSessionClient = () => {
  const config = import.meta.server
    ? useRuntimeConfig()
    : useRuntimeConfig().public;
  const baseURL = `${config.strapi.url as string}${config.strapi.prefix as string}`;
  const token = useSessionToken();

  return async <T = unknown>(
    url: string,
    fetchOptions: FetchOptions = {},
  ): Promise<T> => {
    const headers: Record<string, string> = {};
    if (token?.value) {
      headers.Authorization = `Bearer ${token.value}`;
    }

    if (fetchOptions.params) {
      const params = stringify(fetchOptions.params as object, {
        encodeValuesOnly: true,
      });
      if (params) {
        url = `${url}?${params}`;
      }
      delete fetchOptions.params;
    }

    return $fetch<T>(url, {
      retry: 0,
      baseURL,
      ...fetchOptions,
      headers: {
        ...headers,
        ...((fetchOptions.headers as Record<string, string>) ?? {}),
      },
    });
  };
};
