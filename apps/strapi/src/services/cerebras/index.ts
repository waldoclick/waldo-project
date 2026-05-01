import { CerebrasService } from "./cerebras.service";

let cerebrasService: CerebrasService | null = null;

function getCerebrasService(): CerebrasService {
  if (!cerebrasService) {
    cerebrasService = new CerebrasService();
  }
  return cerebrasService;
}

export const generateText = (prompt: string) =>
  getCerebrasService().generate({ prompt });

export { CerebrasService };
export type {
  ICerebrasService,
  CerebrasRequest,
  CerebrasResponse,
} from "./cerebras.types";
