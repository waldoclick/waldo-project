import { FactoConfig } from "../config/facto.config";
import { factoService } from "../factories/facto.factory";
import { ElectronicInvoiceService } from "../services/electronic-invoice.service";
import { ElectronicTicketService } from "../services/electronic-ticket.service";
import {
  IFactoDocumentHeader,
  IFactoDocumentDetail,
  IFactoDocumentTotals,
  IFactoLegacyResponse,
  IFactoDocument,
} from "../types/index";
import dotenv from "dotenv";
import generalUtils from "../../../api/payment/utils/general.utils";

// Cargar variables de entorno
dotenv.config();

// Configurar variables de entorno específicas para pruebas de Facto
process.env.FACTO_URL =
  process.env.FACTO_URL || "https://conexion.facto.cl/documento.php?wsdl";
process.env.FACTO_USER = process.env.FACTO_USER || "1.111.111-4/pruebasapi";
process.env.FACTO_PASSWORD =
  process.env.FACTO_PASSWORD || "90809d7721fe3cdcf1668ccf33fea982";

describe("Facto Service Connection", () => {
  let config: FactoConfig;

  beforeEach(() => {
    config = FactoConfig.getInstance();
  });

  it("should connect to Facto service successfully", async () => {
    await expect(config.initializeClient()).resolves.not.toThrow();
    const client = config.getClient();
    expect(client).toBeDefined();
  });
});

describe("Facto Document Factory", () => {
  let invoiceService: ElectronicInvoiceService;
  let ticketService: ElectronicTicketService;

  beforeEach(() => {
    invoiceService = new ElectronicInvoiceService();
    ticketService = new ElectronicTicketService();
  });

  // it("should create and emit an electronic invoice successfully", async () => {
  //   const header: IFactoDocumentHeader = {
  //     tipo_dte: 33,
  //     fecha_emision: new Date().toISOString().split("T")[0],
  //     receptor_rut: "12345678-5",
  //     receptor_razon: "Test Company",
  //     receptor_direccion: "Test Street 123",
  //     receptor_comuna: "Test Comuna",
  //     receptor_ciudad: "Test City",
  //     receptor_telefono: "123456789",
  //     receptor_giro: "Test Giro",
  //     receptor_email: "test@example.com",
  //     condiciones_pago: "0",
  //   };

  //   const details: IFactoDocumentDetail[] = [
  //     {
  //       cantidad: 1,
  //       unidad: "UN",
  //       glosa: "Producto A",
  //       monto_unitario: 199900,
  //       exento_afecto: 1,
  //     },
  //     {
  //       cantidad: 1,
  //       unidad: "UN",
  //       glosa: "Producto B",
  //       monto_unitario: 10000,
  //       exento_afecto: 1,
  //     },
  //   ];

  //   const totals: IFactoDocumentTotals = {
  //     total_exento: 0,
  //     total_afecto: 209900,
  //     total_iva: Math.round(209900 * 0.19),
  //     total_otrosimpuestos: 0,
  //     total_final: 209900 + Math.round(209900 * 0.19),
  //   };

  //   const documentResponse = await factoService.createDocument(true, {
  //     encabezado: header,
  //     detalles: details,
  //     totales: totals,
  //   });
  //   const document: IFactoDocument = {
  //     encabezado: {
  //       ...documentResponse.return.encabezado,
  //       tipo_dte: Number(documentResponse.return.encabezado.tipo_dte),
  //       folio: Number(documentResponse.return.encabezado.folio),
  //     },
  //     detalles: details,
  //     totales: {
  //       total_exento: Number(documentResponse.return.totales.total_exento),
  //       total_afecto: Number(documentResponse.return.totales.total_afecto),
  //       total_iva: Number(documentResponse.return.totales.total_iva),
  //       total_otrosimpuestos: Number(
  //         documentResponse.return.totales.total_otrosimpuestos,
  //       ),
  //       total_final: Number(documentResponse.return.totales.total_final),
  //     },
  //   };
  //   const response = await invoiceService.emitInvoice(document);

  //   expect(response.return.resultado.status).toBe("0");
  //   expect(response.return.encabezado.tipo_dte).toBe("33");
  //   expect(response.return.enlaces.dte_xml).toBeDefined();
  //   expect(response.return.enlaces.dte_pdf).toBeDefined();
  // }, 10000);

  // it("should create and emit an electronic ticket successfully", async () => {
  //   const header: IFactoDocumentHeader = {
  //     tipo_dte: 39,
  //     fecha_emision: new Date().toISOString().split("T")[0],
  //     receptor_rut: "12345678-5",
  //     receptor_razon: "Test Company",
  //     receptor_direccion: "Test Street 123",
  //     receptor_comuna: "Test Comuna",
  //     receptor_ciudad: "Test City",
  //     receptor_telefono: "123456789",
  //     receptor_giro: "Test Giro",
  //     receptor_email: "test@example.com",
  //     condiciones_pago: "0",
  //   };

  //   const details: IFactoDocumentDetail[] = [
  //     {
  //       cantidad: 1,
  //       unidad: "UN",
  //       glosa: "Test Product",
  //       monto_unitario: 1000,
  //       exento_afecto: 1,
  //     },
  //   ];

  //   const totals: IFactoDocumentTotals = {
  //     total_exento: 0,
  //     total_afecto: 1000,
  //     total_iva: 190,
  //     total_otrosimpuestos: 0,
  //     total_final: 1190,
  //   };

  //   const documentResponse = await factoService.createDocument(false, {
  //     encabezado: header,
  //     detalles: details,
  //     totales: totals,
  //   });
  //   const document: IFactoDocument = {
  //     encabezado: {
  //       ...documentResponse.return.encabezado,
  //       tipo_dte: Number(documentResponse.return.encabezado.tipo_dte),
  //       folio: Number(documentResponse.return.encabezado.folio),
  //     },
  //     detalles: details,
  //     totales: {
  //       total_exento: Number(documentResponse.return.totales.total_exento),
  //       total_afecto: Number(documentResponse.return.totales.total_afecto),
  //       total_iva: Number(documentResponse.return.totales.total_iva),
  //       total_otrosimpuestos: Number(
  //         documentResponse.return.totales.total_otrosimpuestos,
  //       ),
  //       total_final: Number(documentResponse.return.totales.total_final),
  //     },
  //   };
  //   const response = await ticketService.emitTicket(document);

  //   expect(response.return.resultado.status).toBe("0");
  //   expect(response.return.encabezado.tipo_dte).toBe("39");
  //   expect(response.return.enlaces.dte_xml).toBeDefined();
  //   expect(response.return.enlaces.dte_pdf).toBeDefined();
  // }, 10000);

  it("should calculate correct IVA and total afecto for given products", async () => {
    const items = [
      { name: "Producto A", price: 199900, quantity: 1 },
      { name: "Producto B", price: 10000, quantity: 1 },
    ];

    const taxDetails = generalUtils.calculateTaxDetails(items);

    expect(taxDetails.total_afecto).toBe(176386); // Expected total afecto
    // expect(taxDetails.total_iva).toBe(33370); // Expected total IVA
    // expect(taxDetails.total_final).toBe(209000); // Expected total final
  });
});
