import { PackType, FeaturedType, AdReservation } from "../types/payment.type";
import adPackUtils from "./pack.utils";
import featuredUtils from "./featured.utils";
import { factoService } from "../../../services/facto";

interface TaxItem {
  name: string;
  price: number;
  quantity: number;
  precio_neto?: number;
}

interface TaxDetails {
  itemsWithNetPrice: TaxItem[];
  total_afecto: number;
  total_iva: number;
  total_final: number;
}

interface FactoDocumentData {
  isInvoice: boolean;
  userDetails: any;
  items: TaxItem[];
}

class GeneralUtils {
  /**
   * Checks if payment is required based on pack and featured types
   */
  public async isPaymentRequired(
    pack: PackType,
    featured: FeaturedType
  ): Promise<boolean> {
    // Free combinations - no payment required
    if (
      (pack === "free" && (featured === "free" || featured === false)) ||
      (pack === "paid" && (featured === "free" || featured === false))
    ) {
      return false;
    }

    // Paid combinations - payment required
    if (typeof pack === "number" || featured === true) {
      return true;
    }

    return false; // Default case
  }

  /**
   * Calculates payment details based on pack and featured options
   */
  public async PaymentDetails(
    pack: PackType,
    featured: FeaturedType,
    userId: string,
    adId: string
  ) {
    let amount = 0;
    const items = [];

    if (typeof pack === "number") {
      const packData = await adPackUtils.getAdPack(pack);
      amount += Number(packData?.data?.price);
      items.push({
        name: packData?.data?.name,
        price: Number(packData?.data?.price),
        quantity: 1,
      });
    }

    if (typeof featured === "boolean" && featured) {
      const featuredPrice = Number(process.env.AD_FEATURED_PRICE) || 10000;
      amount += featuredPrice;
      items.push({
        name: "Anuncio destacado",
        price: featuredPrice,
        quantity: 1,
      });
    }

    const uniqueId = Date.now().toString();
    const meta = `${userId}-${adId}-${uniqueId}`;
    const buyOrder = `order-${meta}`;
    const sessionId = `session-${meta}`;

    return {
      amount,
      buyOrder,
      sessionId,
      items,
    };
  }

  /**
   * Extracts userId and adId from a meta string
   */
  public extractIdsFromMeta(meta: string): {
    userId: string;
    adId: string;
    isInvoice: boolean;
  } {
    const parts = meta.split("-");
    // Para anuncios: order-userId-adId-uniqueId
    // Para packs: order-userId-packId-isInvoice
    if (parts.length === 4) {
      // Si el último elemento es 'true' o 'false', es un pack
      if (parts[3] === "true" || parts[3] === "false") {
        return {
          userId: parts[1],
          adId: parts[2],
          isInvoice: parts[3] === "true" ? true : false,
        };
      }
      // Si no, es un anuncio con uniqueId
      return {
        userId: parts[1],
        adId: parts[2],
        isInvoice: false,
      };
    }
    // Fallback para formato anterior (3 partes)
    return {
      userId: parts[1],
      adId: parts[2],
      isInvoice: false,
    };
  }

  /**
   * Ensures a user has 3 free ad reservations available
   */
  public async ensureFreeReservations(userId: string) {
    try {
      // Get all reservations for the user
      const reservations = (await strapi.entityService.findMany(
        "api::ad-reservation.ad-reservation",
        {
          filters: {
            user: { id: { $eq: userId } },
            price: 0,
            $or: [
              { ad: null },
              {
                ad: {
                  remaining_days: { $gt: 0 },
                },
              },
            ],
          },
          populate: ["ad"],
        }
      )) as AdReservation[];

      const availableReservations = reservations.filter((r) => !r.ad).length;
      const activeReservations = reservations.filter(
        (r) => r.ad && r.ad.remaining_days
      ).length;
      const totalReservations = availableReservations + activeReservations;
      const neededReservations = 3 - totalReservations;

      const summary = {
        userId,
        availableReservations,
        activeReservations,
        neededReservations: 0,
      };

      // Create new reservations if needed
      if (neededReservations > 0) {
        for (let i = 0; i < neededReservations; i++) {
          await strapi.entityService.create(
            "api::ad-reservation.ad-reservation",
            {
              data: {
                price: 0,
                total_days: 15,
                user: userId,
                publishedAt: new Date(),
              },
            }
          );
          summary.neededReservations++;
        }
      }

      return summary;
    } catch (error) {
      console.error("Error in ensureFreeReservations:", error);
      throw error;
    }
  }

  /**
   * Ensures a user has a specified number of free featured reservations
   */
  public async ensureFreeFeaturedReservations(
    userId: string,
    quantity: number
  ) {
    try {
      const summary = {
        userId,
        featuredReservationsCreated: 0,
      };

      for (let i = 0; i < quantity; i++) {
        await featuredUtils.createAdFeaturedReservation(
          userId,
          "0",
          "Free featured reservation created"
        );
        summary.featuredReservationsCreated++;
      }

      return summary;
    } catch (error) {
      console.error("Error in ensureFreeFeaturedReservations:", error);
      throw error;
    }
  }

  /**
   * Genera un documento electrónico (boleta o factura) usando el servicio de Facto
   * @param data Datos necesarios para generar el documento
   * @returns Respuesta del servicio Facto
   */
  public async generateFactoDocument(data: FactoDocumentData) {
    try {
      // Calcular detalles de impuestos
      const taxDetails = this.calculateTaxDetails(data.items);

      // Crear y enviar el documento a Facto
      const documentResponse = await factoService.createDocument(
        data.isInvoice,
        {
          encabezado: {
            fecha_emision: new Date().toISOString().split("T")[0],
            receptor_rut: data.userDetails.rut,
            receptor_razon: data.userDetails.name,
            receptor_direccion: `${data.userDetails.address} ${data.userDetails.address_number}`,
            receptor_comuna: data.userDetails.commune,
            receptor_ciudad:
              data.userDetails.region || data.userDetails.commune,
            receptor_telefono: data.userDetails.phone || "",
            receptor_giro: data.userDetails.type,
            receptor_email: data.userDetails.email,
            condiciones_pago: "0",
          },
          detalles: taxDetails.itemsWithNetPrice.map((item) => ({
            cantidad: item.quantity,
            unidad: "UN",
            glosa: item.name,
            monto_unitario: item.precio_neto,
            exento_afecto: 1,
          })),
          totales: {
            total_exento: 0,
            total_afecto: taxDetails.total_afecto,
            total_iva: taxDetails.total_iva,
            total_otrosimpuestos: 0,
            total_final: taxDetails.total_final,
          },
        }
      );

      console.log("Documento emitido:", documentResponse);
      return documentResponse;
    } catch (error) {
      console.error("Error al generar documento en Facto:", error);
      throw error;
    }
  }

  /**
   * Calculates tax details for items in a purchase
   * @param items Array of items with price and quantity properties
   * @returns Object containing processed items with net prices and calculated totals
   *
   * This method:
   * - Calculates net price (without VAT) for each item based on Chile's 19% VAT rate
   * - Computes VAT amount for each item
   * - Calculates total_afecto (amount subject to tax), total_iva (total VAT), and total_final (final price)
   * - Returns rounded totals and items with added net price information
   */
  public calculateTaxDetails(items: TaxItem[]): TaxDetails {
    // Calcular neto total redondeando neto por ítem antes de sumar
    const total_afecto = items.reduce((sum, item) => {
      const precio_neto = Math.round(item.price / 1.19);
      return sum + precio_neto * item.quantity;
    }, 0);

    // Calcular IVA como 19% del neto total redondeado
    const total_iva = Math.round(total_afecto * 0.19);

    // Calcular total final
    const total_final = total_afecto + total_iva;

    // Agregar neto individual para uso informativo, redondeado por ítem
    const itemsWithNetPrice = items.map((item) => {
      const precio_neto = Math.round(item.price / 1.19);
      const iva = item.price - precio_neto;

      return {
        ...item,
        precio_neto,
        iva: Math.round(iva),
      };
    });

    console.log(
      `Total Afecto: ${total_afecto}, Total IVA: ${total_iva}, Total Final: ${total_final}`
    );

    return {
      itemsWithNetPrice,
      total_afecto,
      total_iva,
      total_final,
    };
  }
}

export default new GeneralUtils();
