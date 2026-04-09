import { Context } from "koa";

interface UserData {
  id: string | number;
  documentId?: string;
  username?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  rut?: string;
  phone?: string;
  address?: string;
  address_number?: number;
  postal_code?: string;
  commune?: unknown;
  is_company?: boolean;
  business_name?: string;
  business_type?: string;
  business_rut?: string;
  business_address?: string;
  business_address_number?: number;
  business_postal_code?: string;
  business_commune?: unknown;
}

export interface BillingDetails {
  name: string;
  rut: string;
  address: string;
  address_number: number;
  postal_code: string;
  commune?: unknown;
  region?: string;
  email?: string;
  phone?: string;
  type?: string;
}

/**
 * Obtiene los datos del usuario conectado
 * @param ctx Contexto de Koa
 * @returns UserData con los datos del usuario
 */
export const getCurrentUser = async (ctx: Context): Promise<UserData> => {
  if (!ctx.state.user) {
    throw new Error("No hay usuario autenticado");
  }

  const user = await strapi.db.query("plugin::users-permissions.user").findOne({
    where: { id: ctx.state.user.id },
    populate: {
      commune: {
        populate: ["region"],
      },
      business_commune: {
        populate: ["region"],
      },
    },
  });

  return user;
};

/**
 * Obtiene los datos de facturación del usuario
 * @param userId ID del usuario
 * @param isInvoice Si es factura o boleta
 * @returns Objeto con los datos de facturación
 */
export const documentDetails = async (
  userId: number | string,
  isInvoice: boolean
): Promise<BillingDetails> => {
  try {
    const user = (await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: userId },
        populate: {
          commune: {
            populate: ["region"],
          },
          business_commune: {
            populate: ["region"],
          },
        },
      })) as UserData;

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (isInvoice && !user.is_company) {
      throw new Error("El usuario no es una empresa");
    }

    if (isInvoice) {
      // Datos de empresa para factura
      return {
        name: user.business_name,
        type: user.business_type,
        rut: user.business_rut,
        email: user.email,
        phone: user.phone,
        address: user.business_address,
        address_number: user.business_address_number,
        postal_code: user.business_postal_code,
        commune: (user.business_commune as { name?: string } | null | undefined)
          ?.name,
        region: (
          user.business_commune as
            | { region?: { name?: string } }
            | null
            | undefined
        )?.region?.name,
      };
    } else {
      // Datos personales para boleta
      return {
        name: `${user.firstname} ${user.lastname}`,
        rut: user.rut,
        email: user.email,
        phone: user.phone,
        address: user.address,
        address_number: user.address_number,
        postal_code: user.postal_code,
        commune: (user.commune as { name?: string } | null | undefined)?.name,
        region: (
          user.commune as { region?: { name?: string } } | null | undefined
        )?.region?.name,
      };
    }
  } catch (error) {
    console.error("Error en userBillingDetails:", error);
    throw error;
  }
};
