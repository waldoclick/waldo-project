import type { User } from "@/types/user";

export const useSessionUser = <T = User>() =>
  useState<T | null>("session_user", () => null);
