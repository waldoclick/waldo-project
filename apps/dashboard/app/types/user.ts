export interface UserRole {
  name: string;
  id?: number;
}

export interface UserRelation {
  name?: string;
  id?: number;
  data?: { id: number; name?: string; attributes?: { name?: string } };
}

export interface User {
  id: number;
  username: string;
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
  firstname?: string;
  lastname?: string;
  rut?: string;
  phone?: string;
  birthdate?: string;
  address?: string;
  address_number?: string;
  postal_code?: string;
  pro?: boolean;
  is_company?: boolean;
  business_name?: string;
  business_type?: string;
  business_rut?: string;
  business_address?: string;
  business_address_number?: string;
  business_postal_code?: string;
  business_region?: UserRelation;
  business_commune?: UserRelation;
  createdAt: string;
  updatedAt?: string;
  role?: UserRole;
  region?: UserRelation;
  commune?: UserRelation;
}
