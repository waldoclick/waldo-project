import type { User } from "@/types/user";
export const useSessionUser = () =>
  useState<User | null>("session_user", () => null);
