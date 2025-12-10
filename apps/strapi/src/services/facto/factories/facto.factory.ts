// src/services/facto/factories/facto.factory.ts
import { ElectronicTicketService } from "../services/electronic-ticket.service";
import { ElectronicInvoiceService } from "../services/electronic-invoice.service";
import { IFactoDocument, IFactoLegacyResponse } from "../types/index";

enum DocumentType {
  INVOICE = 33,
  TICKET = 39,
}

export const factoService = {
  /**
   * Crea y emite un documento electrónico (factura o boleta)
   * @param is_invoice true para factura, false para boleta
   * @param datos datos del documento a emitir
   */
  createDocument: async (
    is_invoice: boolean,
    datos: any
  ): Promise<IFactoLegacyResponse> => {
    // Determinar el tipo de documento según el parámetro booleano
    const tipo_dte = is_invoice ? DocumentType.INVOICE : DocumentType.TICKET;

    // Asegurar que el tipo esté establecido en los datos
    const documento = {
      ...datos,
      encabezado: {
        ...datos.encabezado,
        tipo_dte,
      },
    };

    if (is_invoice) {
      const service = new ElectronicInvoiceService();
      return service.emitInvoice(documento);
    } else {
      const service = new ElectronicTicketService();
      return service.emitTicket(documento);
    }
  },
};
