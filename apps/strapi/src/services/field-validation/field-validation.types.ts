export type FieldMap = Record<string, string>;
export type ValidationResult = Record<string, boolean>;

export interface IFieldValidationService {
  validateFields(fields: FieldMap): Promise<ValidationResult>;
}
