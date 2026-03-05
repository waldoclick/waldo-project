export interface UserRole {
  name: string;
  id?: number;
}

export interface UserRelation {
  name?: string;
  id?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
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
  createdAt: string;
  updatedAt?: string;
  role?: UserRole;
  region?: UserRelation;
  commune?: UserRelation;
}
