export interface SubscriptionPro {
  id: number;
  documentId: string;
  card_type: string | null;
  card_last4: string | null;
  pending_invoice: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    documentId?: string;
    email: string;
    username?: string;
  } | null;
}
