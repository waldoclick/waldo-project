// /src/extensions/users-permissions/controllers/userUpdateController.ts

import { Context } from "koa";
import { zohoService } from "../../../services/zoho";
import logger from "../../../utils/logtail";

export const updateUser = async (ctx: Context) => {
  try {
    // console.log("userUpdateController", ctx.state.user);
    const { id } = ctx.state.user;
    const { data } = ctx.request.body;

    // Debug logs
    console.log("Update User Data:", {
      is_company: data.is_company,
      has_business_fields: {
        business_address: !!data.business_address,
        business_address_number: !!data.business_address_number,
        business_commune: !!data.business_commune,
        business_name: !!data.business_name,
        business_region: !!data.business_region,
        business_rut: !!data.business_rut,
        business_type: !!data.business_type,
      },
    });

    // Remove recaptchaToken from data
    delete data.recaptchaToken;

    // Required fields validation
    const baseRequiredFields = [
      "address",
      "address_number",
      "birthdate",
      "commune",
      "firstname",
      "lastname",
      "phone",
      "region",
      "rut",
    ];

    // Validar campos base primero
    const missingBaseFields = baseRequiredFields.filter(
      (field) => !data[field]
    );
    if (missingBaseFields.length > 0) {
      ctx.throw(
        400,
        `Missing required fields: ${missingBaseFields.join(", ")}`
      );
    }

    // Si no es empresa, limpiar todos los campos de negocio
    if (!data.is_company) {
      const businessFields = [
        "business_address",
        "business_address_number",
        "business_commune",
        "business_name",
        "business_region",
        "business_rut",
        "business_type",
        "business_postal_code",
      ];

      businessFields.forEach((field) => {
        delete data[field];
      });
    }

    // Convert postal codes to string if they exist
    if (data.business_postal_code !== undefined) {
      data.business_postal_code = data.business_postal_code.toString();
    }
    if (data.postal_code !== undefined) {
      data.postal_code = data.postal_code.toString();
    }

    // Update user in Strapi
    const updatedUser = (await strapi.entityService.update(
      "plugin::users-permissions.user",
      id,
      {
        data,
      }
    )) as any; // Type assertion to handle relations

    // Buscar contacto en Zoho y crear si no existe, o actualizar si existe
    try {
      const contact = await zohoService.findContact(updatedUser.email);
      const data = {
        First_Name: updatedUser.firstname || updatedUser.username,
        Last_Name: updatedUser.lastname || updatedUser.username,
        Email: updatedUser.email,
        User_ID: updatedUser.id.toString(),
        Phone: updatedUser.phone,
        Date_of_Birth: updatedUser.birthdate?.toString(),
        Mailing_Street: updatedUser.address
          ? `${updatedUser.address} ${updatedUser.address_number || ""}`.trim()
          : undefined,
        Mailing_Zip: updatedUser.postal_code?.toString(),
        Mailing_State: updatedUser.commune?.region?.name,
        Mailing_City: updatedUser.commune?.name,
        Other_Street: updatedUser.business_address
          ? `${updatedUser.business_address} ${
              updatedUser.business_address_number || ""
            }`.trim()
          : undefined,
        Other_Zip: updatedUser.business_postal_code?.toString(),
        Other_State: updatedUser.business_commune?.region?.name,
        Other_City: updatedUser.business_commune?.name,
      };

      if (contact) {
        await zohoService.updateContact(contact.id, data);
        logger.info("Contact updated successfully in Zoho", {
          user: updatedUser,
          contactId: contact.id,
        });
      } else {
        await zohoService.createContact(data);
        logger.info("Contact created successfully in Zoho", {
          user: updatedUser,
        });
      }
    } catch (error) {
      logger.error("Failed to sync Zoho contact", {
        user: updatedUser,
        error: error.message,
        stack: error.stack,
      });
      // No throw error to prevent user update failure
    }

    return updatedUser;
  } catch (error) {
    ctx.throw(400, error.message);
  }
};
