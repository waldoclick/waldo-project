/**
 * google-one-tap service module
 * Re-exports types and service, provides singleton instance.
 */

// Exportar tipos
export * from "./google-one-tap.types";

// Exportar implementación
export * from "./google-one-tap.service";

// Exportar instancia singleton (OAuth2Client se inicializa una vez, JWKS cache compartida)
import { GoogleOneTapService } from "./google-one-tap.service";
export const googleOneTapService = new GoogleOneTapService();
