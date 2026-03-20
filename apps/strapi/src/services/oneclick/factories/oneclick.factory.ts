import { OneclickService } from "../services/oneclick.service";

/**
 * Factory function for creating OneclickService instances.
 * Follows the same pattern as flowServiceFactory for consistency.
 */
export function oneclickServiceFactory(): OneclickService {
  return new OneclickService();
}
