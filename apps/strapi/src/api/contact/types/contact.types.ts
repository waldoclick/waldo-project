export interface ContactData {
  fullname: string;
  email: string;
  message: string;
  ip?: string;
  phone?: string;
  company?: string;
}

export interface ContactEntity extends ContactData {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactResponse {
  data: ContactData;
}

export interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
}
