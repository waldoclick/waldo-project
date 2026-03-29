export interface FormRegister {
  is_company: boolean;
  firstname: string;
  lastname: string;
  email: string;
  rut: string;
  password: string;
  confirm_password?: string;
  username: string;
  accepted_age_confirmation: boolean;
  accepted_terms: boolean;
}
