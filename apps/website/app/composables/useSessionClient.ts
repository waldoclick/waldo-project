import { stringify } from "qs";
import type { FetchOptions } from "ofetch";

export const useSessionClient = () => {
  const config = useRuntimeConfig();
  const baseURL = `${(config.public as { baseUrl: string }).baseUrl}/api`;

  return async <T = unknown>(
    url: string,
    fetchOptions: FetchOptions = {},
  ): Promise<T> => {
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
      ...(fetchOptions as Record<string, unknown>),
      headers: {
        ...((fetchOptions.headers as Record<string, string> | undefined) ?? {}),
      },
    }) as Promise<T>;
  };
};
