import { CerebrasService } from "./cerebras.service";

const cerebrasService = new CerebrasService();

export const generateText = (prompt: string) =>
  cerebrasService.generate({ prompt });

export { CerebrasService };
export type {
  ICerebrasService,
  CerebrasRequest,
  CerebrasResponse,
} from "./cerebras.types";
