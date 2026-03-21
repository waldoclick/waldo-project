export interface IOneclickStartResponse {
  success: boolean;
  token?: string;
  urlWebpay?: string;
  error?: unknown;
}

export interface IOneclickFinishResponse {
  success: boolean;
  tbkUser?: string;
  cardType?: string;
  last4CardDigits?: string;
  error?: unknown;
}

export interface IOneclickAuthorizeResponse {
  success: boolean;
  authorizationCode?: string;
  responseCode?: number;
  rawResponse?: unknown;
  error?: unknown;
}

export interface IOneclickDeleteResponse {
  success: boolean;
  error?: unknown;
}

/**
 * Builds the Oneclick username from a Strapi documentId.
 * Pattern: "user-{documentId}" — max 29 chars (5 + 24), well within the 40-char SDK limit.
 * This function is exported for reuse across phases (e.g., Phase 104 inscription.delete()).
 */
export const buildOneclickUsername = (documentId: string): string => {
  return `user-${documentId}`;
};
