export interface Pack {
  id: number;
  documentId: string;
  name: string;
  text?: string;
  total_days: number;
  total_ads: number;
  total_features: number;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
