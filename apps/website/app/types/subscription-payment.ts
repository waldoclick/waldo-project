export type SubscriptionPaymentStatus = "approved" | "failed" | "deactivated";

export interface SubscriptionPayment {
  id: number;
  documentId: string;
  amount: number;
  status: SubscriptionPaymentStatus;
  parent_buy_order: string | null;
  child_buy_order: string | null;
  authorization_code: string | null;
  response_code: string | null;
  period_start: string | null;
  period_end: string | null;
  charged_at: string | null;
  charge_attempts: number;
  next_charge_attempt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    documentId?: string;
    email: string;
    username?: string;
  } | null;
}
