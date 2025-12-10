import { IFactoDocument, IFactoLegacyResponse } from "../types/index";
import { FactoConfig } from "../config/facto.config";

export class ElectronicTicketService {
  private config: FactoConfig;

  constructor() {
    this.config = FactoConfig.getInstance();
  }

  public async emitTicket(
    document: IFactoDocument
  ): Promise<IFactoLegacyResponse> {
    if (document.encabezado.tipo_dte !== 39) {
      throw new Error(
        "Tipo de documento inválido. Se esperaba boleta electrónica (39)"
      );
    }

    await this.config.initializeClient();
    const client = this.config.getClient();

    const params = {
      documento: {
        encabezado: {
          tipo_dte: document.encabezado.tipo_dte,
          fecha_emision: document.encabezado.fecha_emision,
          receptor_rut: document.encabezado.receptor_rut,
          receptor_razon: document.encabezado.receptor_razon,
          receptor_direccion: document.encabezado.receptor_direccion,
          receptor_comuna: document.encabezado.receptor_comuna,
          receptor_ciudad: document.encabezado.receptor_ciudad,
          receptor_telefono: document.encabezado.receptor_telefono,
          receptor_giro: document.encabezado.receptor_giro,
          condiciones_pago: document.encabezado.condiciones_pago,
          receptor_email: document.encabezado.receptor_email,
          identificador_externo_doc:
            document.encabezado.identificador_externo_doc,
        },
        detalles: {
          detalle: document.detalles.map((detalle) => ({
            cantidad: detalle.cantidad,
            unidad: detalle.unidad,
            glosa: detalle.glosa,
            monto_unitario: detalle.monto_unitario,
            exento_afecto: detalle.exento_afecto,
          })),
        },
        totales: {
          total_exento: document.totales.total_exento,
          total_afecto: document.totales.total_afecto,
          total_iva: document.totales.total_iva,
          total_otrosimpuestos: document.totales.total_otrosimpuestos || 0,
          total_final: document.totales.total_final,
        },
      },
    };

    console.log("Enviando documento a Facto:", JSON.stringify(params, null, 2));

    return new Promise((resolve, reject) => {
      client.emitirDocumento(params, (err: any, result: any) => {
        if (err) {
          console.error("Error en la llamada SOAP:", err);
          reject(err);
          return;
        }

        console.log("Respuesta de Facto:", JSON.stringify(result, null, 2));

        if (!result || !result.return || !result.return.resultado) {
          reject(new Error("Respuesta inválida del servicio"));
          return;
        }

        if (result.return.resultado.status !== "0") {
          reject(
            new Error(
              result.return.resultado.mensaje_error ||
                "Error al emitir documento"
            )
          );
          return;
        }

        resolve(result);
      });
    });
  }
}
