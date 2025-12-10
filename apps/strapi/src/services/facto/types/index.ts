export interface IFactoConfig {
  url: string;
  user: string;
  password: string;
}

export interface IFactoDocumentOptions {
  id_plantilla?: number;
  valores_brutos?: string;
  redondeo_tipo?: "neto" | "bruto";
  empresa_email?: string;
  empresa_web?: string;
}

export interface IFactoDocumentHeader {
  tipo_dte: number;
  fecha_emision: string;
  folio?: number;
  receptor_rut: string;
  receptor_razon: string;
  receptor_direccion: string;
  receptor_comuna: string;
  receptor_ciudad: string;
  receptor_telefono: string;
  receptor_giro: string;
  receptor_email: string;
  condiciones_pago: string;
  identificador_externo_doc?: string;
  observaciones?: string;
  observaciones_despliegue?: number;
}

export interface IFactoDocumentDetail {
  cantidad: number;
  unidad: string;
  glosa: string;
  descripcionlarga?: string;
  sku?: string;
  monto_unitario: number;
  exento_afecto: number | boolean;
  descuentorecargo_monto?: number;
  descuentorecargo_porcentaje?: number;
  impuesto_codigo?: number;
  impuesto_valor?: number;
}

export interface IFactoDocumentTotals {
  total_exento: number;
  total_afecto: number;
  total_iva: number;
  total_otrosimpuestos: number;
  total_final: number;
}

export interface IFactoDocument {
  opciones?: IFactoDocumentOptions;
  encabezado: IFactoDocumentHeader;
  detalles: IFactoDocumentDetail[];
  totales: IFactoDocumentTotals;
}

// Versión moderna de la respuesta de la API
export interface IFactoResponse {
  resultado: {
    status: number;
    mensaje_error?: string;
  };
  encabezado: IFactoDocumentHeader;
  detalles: IFactoDocumentDetail[];
  totales: IFactoDocumentTotals;
  enlaces: {
    dte_xml: string;
    dte_pdf: string;
    dte_pdfcedible?: string;
    dte_timbre: string;
  };
}

// Versión original de la respuesta de la API (para retrocompatibilidad)
export interface IFactoLegacyResponse {
  return: {
    resultado: {
      status: string;
      mensaje_error: string | null;
    };
    encabezado: {
      tipo_dte: string;
      fecha_emision: string;
      receptor_rut: string;
      receptor_razon: string;
      receptor_direccion: string;
      receptor_comuna: string;
      receptor_ciudad: string;
      receptor_telefono: string;
      receptor_giro: string;
      condiciones_pago: string;
      receptor_email: string;
      folio: string;
    };
    totales: {
      total_exento: string;
      total_afecto: string;
      total_iva: string;
      total_otrosimpuestos: string;
      total_final: string;
    };
    enlaces: {
      dte_xml: string;
      dte_pdf: string;
      dte_pdfcedible: string;
      dte_timbre: string;
    };
  };
}
