// Tipos para autenticación de Strapi
export interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  role?: StrapiRole; // Hacer opcional el role
}

export interface StrapiRole {
  id: number;
  name: string;
  description: string;
  type: string;
}

// Tipos para formularios de autenticación
export interface LoginCredentials {
  identifier: string; // email o username
  password: string;
  recaptchaToken?: string;
}

export interface ForgotPasswordData {
  email: string;
  recaptchaToken?: string;
}

export interface ResetPasswordData {
  password: string;
  passwordConfirmation: string;
  code: string; // código de reset
  recaptchaToken?: string;
}

// Tipos para respuesta de error
export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

// Tipos para configuración
export interface StrapiConfig {
  baseURL: string;
  apiToken?: string;
}

// Tipos para anuncios
export interface StrapiAd {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  address_number?: string;
  phone?: string;
  email?: string;
  year?: number;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  price: number;
  active: boolean;
  rejected: boolean;
  reason_for_rejection?: string;
  currency: 'CLP' | 'USD';
  duration_days: number;
  remaining_days: number;
  details?: Record<string, unknown>;
  is_paid: boolean;
  needs_payment: boolean;
  reviewed?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  commune?: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  condition?: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  user?: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    role?: StrapiRole;
  };
  category?: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  reviewed_by?: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    role?: StrapiRole;
  };
  gallery?: Array<{
    id: number;
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: Record<string, unknown>;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    provider_metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface StrapiCommune {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiCondition {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiCategory {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiMedia {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: Record<string, unknown>;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl?: string;
    provider: string;
    provider_metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiAdsResponse {
  data: StrapiAd[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiUsersResponse {
  data: StrapiUser[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos para órdenes/ventas
export interface StrapiOrder {
  id: number;
  amount: number;
  buy_order: string;
  is_invoice: boolean;
  payment_method: 'webpay';
  payment_response?: Record<string, unknown>;
  document_details?: Record<string, unknown>;
  document_response?: Record<string, unknown>;
  items?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    role?: StrapiRole;
  };
  ad?: {
    id: number;
    name: string;
    price: number;
    currency: 'CLP' | 'USD';
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiOrdersResponse {
  data: StrapiOrder[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos para datos agrupados por mes
export interface SalesByMonthData {
  mes: string;
  monto: number;
}

// Tipos para regiones
export interface StrapiRegion {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  communes?: StrapiCommune[];
}

export interface StrapiRegionsResponse {
  data: StrapiRegion[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos para comunas
export interface StrapiCommune {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  region?: StrapiRegion;
}

export interface StrapiCommunesResponse {
  data: StrapiCommune[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos para categorías
export interface StrapiCategory {
  id: number;
  name: string;
  slug: string;
  color?: string;
  icon?: {
    id: number;
    url: string;
    alternativeText?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StrapiCategoriesResponse {
  data: StrapiCategory[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos para FAQ
export interface StrapiFaq {
  id: number;
  title: string;
  featured: boolean;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiFaqsResponse {
  data: StrapiFaq[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos para conditions
export interface StrapiCondition {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiConditionsResponse {
  data: StrapiCondition[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos para filtros de Strapi
export interface StrapiFilters {
  [key: string]: string | number | boolean | object | StrapiFilters;
}

// Tipos para parámetros de consulta
export interface StrapiQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: StrapiFilters;
  populate?: string;
}

// Tipos para ad packs
export interface StrapiAdPack {
  id: number;
  name: string;
  text: string;
  total_days: number;
  total_ads: number;
  total_features: number;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiAdPacksResponse {
  data: StrapiAdPack[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos para ad reservations
export interface StrapiAdReservation {
  id: number;
  price: number;
  total_days?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
  ad?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    active: boolean;
    rejected: boolean;
    currency: 'CLP' | 'USD';
    createdAt: string;
    updatedAt: string;
    commune?: {
      id: number;
      name: string;
    };
    category?: {
      id: number;
      name: string;
    };
    user?: {
      id: number;
      username: string;
      email: string;
    };
  };
}

export interface StrapiAdReservationsResponse {
  data: StrapiAdReservation[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos para ad featured reservations
export interface StrapiAdFeaturedReservation {
  id: number;
  price: number;
  total_days?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
  ad?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number;
    active: boolean;
    rejected: boolean;
    currency: 'CLP' | 'USD';
    createdAt: string;
    updatedAt: string;
    commune?: {
      id: number;
      name: string;
    };
    category?: {
      id: number;
      name: string;
    };
    user?: {
      id: number;
      username: string;
      email: string;
    };
  };
}

export interface StrapiAdFeaturedReservationsResponse {
  data: StrapiAdFeaturedReservation[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
